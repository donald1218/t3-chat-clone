# Copyright 2023 LiveKit, Inc.
#

# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Any, cast

from google.auth._default_async import default_async
from google.genai import Client, types
from google.genai.errors import APIError, ClientError, ServerError
from livekit.agents import APIConnectionError, APIStatusError, llm, utils
from livekit.agents.llm import FunctionTool, RawFunctionTool, ToolChoice, utils as llm_utils
from livekit.agents.llm.tool_context import (
    get_function_info,
    get_raw_function_info,
    is_function_tool,
    is_raw_function_tool,
)
from livekit.agents.types import (
    DEFAULT_API_CONNECT_OPTIONS,
    NOT_GIVEN,
    APIConnectOptions,
    NotGivenOr,
)
from livekit.agents.utils import is_given




@dataclass
class _LLMOptions:
    model: str
    temperature: NotGivenOr[float]
    tool_choice: NotGivenOr[ToolChoice]
    max_output_tokens: NotGivenOr[int]
    top_p: NotGivenOr[float]
    top_k: NotGivenOr[float]
    presence_penalty: NotGivenOr[float]
    frequency_penalty: NotGivenOr[float]


class LLM(llm.LLM):
    def __init__(
        self,
        *,
        model: str = "gemma-3-27b-it",
        api_key: NotGivenOr[str] = NOT_GIVEN,
        temperature: NotGivenOr[float] = NOT_GIVEN,
        max_output_tokens: NotGivenOr[int] = NOT_GIVEN,
        top_p: NotGivenOr[float] = NOT_GIVEN,
        top_k: NotGivenOr[float] = NOT_GIVEN,
        presence_penalty: NotGivenOr[float] = NOT_GIVEN,
        frequency_penalty: NotGivenOr[float] = NOT_GIVEN,
        tool_choice: NotGivenOr[ToolChoice] = NOT_GIVEN,
    ) -> None:
        super().__init__()

        gemini_api_key = api_key if is_given(api_key) else os.environ.get("GOOGLE_API_KEY")

        if not gemini_api_key:
            raise ValueError(
                "API key is required for Google API either via api_key or GOOGLE_API_KEY environment variable"  # noqa: E501
            )
        self._opts = _LLMOptions(
            model=model,
            temperature=temperature,
            tool_choice=tool_choice,
            max_output_tokens=max_output_tokens,
            top_p=top_p,
            top_k=top_k,
            presence_penalty=presence_penalty,
            frequency_penalty=frequency_penalty,
        )  
        self._client = Client(
            api_key=gemini_api_key,
        )

    def chat(
        self,
        *,
        chat_ctx: llm.ChatContext,
        tools: list[FunctionTool | RawFunctionTool] | None = None,
        conn_options: APIConnectOptions = DEFAULT_API_CONNECT_OPTIONS,
        parallel_tool_calls: NotGivenOr[bool] = NOT_GIVEN,
        tool_choice: NotGivenOr[ToolChoice] = NOT_GIVEN,
        extra_kwargs: NotGivenOr[dict[str, Any]] = NOT_GIVEN,
    ) -> LLMStream:
        extra = {}

        if is_given(extra_kwargs):
            extra.update(extra_kwargs)

        tool_choice = (
            cast(ToolChoice, tool_choice) if is_given(tool_choice) else self._opts.tool_choice
        )
        if is_given(tool_choice):
            gemini_tool_choice: types.ToolConfig
            if isinstance(tool_choice, dict) and tool_choice.get("type") == "function":
                gemini_tool_choice = types.ToolConfig(
                    function_calling_config=types.FunctionCallingConfig(
                        mode=types.FunctionCallingConfigMode.ANY,
                        allowed_function_names=[tool_choice["function"]["name"]],
                    )
                )
                extra["tool_config"] = gemini_tool_choice
            elif tool_choice == "required":
                tool_names = []
                for tool in tools or []:
                    if is_function_tool(tool):
                        tool_names.append(get_function_info(tool).name)
                    elif is_raw_function_tool(tool):
                        tool_names.append(get_raw_function_info(tool).name)

                gemini_tool_choice = types.ToolConfig(
                    function_calling_config=types.FunctionCallingConfig(
                        mode=types.FunctionCallingConfigMode.ANY,
                        allowed_function_names=tool_names or None,
                    )
                )
                extra["tool_config"] = gemini_tool_choice
            elif tool_choice == "auto":
                gemini_tool_choice = types.ToolConfig(
                    function_calling_config=types.FunctionCallingConfig(
                        mode=types.FunctionCallingConfigMode.AUTO,
                    )
                )
                extra["tool_config"] = gemini_tool_choice
            elif tool_choice == "none":
                gemini_tool_choice = types.ToolConfig(
                    function_calling_config=types.FunctionCallingConfig(
                        mode=types.FunctionCallingConfigMode.NONE,
                    )
                )
                extra["tool_config"] = gemini_tool_choice


        if is_given(self._opts.temperature):
            extra["temperature"] = self._opts.temperature
        if is_given(self._opts.max_output_tokens):
            extra["max_output_tokens"] = self._opts.max_output_tokens
        if is_given(self._opts.top_p):
            extra["top_p"] = self._opts.top_p
        if is_given(self._opts.top_k):
            extra["top_k"] = self._opts.top_k
        if is_given(self._opts.presence_penalty):
            extra["presence_penalty"] = self._opts.presence_penalty
        if is_given(self._opts.frequency_penalty):
            extra["frequency_penalty"] = self._opts.frequency_penalty



        return LLMStream(
            self,
            client=self._client,
            model=self._opts.model,
            chat_ctx=chat_ctx,
            tools=tools or [],
            conn_options=conn_options,
            extra_kwargs=extra,
        )


class LLMStream(llm.LLMStream):
    def __init__(
        self,
        llm: LLM,
        *,
        client: Client,
        model: str,
        chat_ctx: llm.ChatContext,
        conn_options: APIConnectOptions,
        tools: list[FunctionTool | RawFunctionTool],
        extra_kwargs: dict[str, Any],
    ) -> None:
        super().__init__(llm, chat_ctx=chat_ctx, tools=tools, conn_options=conn_options)
        self._client = client
        self._model = model
        self._llm: LLM = llm
        self._extra_kwargs = extra_kwargs

    async def _run(self) -> None:
        retryable = True
        request_id = utils.shortuuid()

        try:
            turns_dict, extra_data = self._chat_ctx.to_provider_format(format="google")
            turns = [types.Content.model_validate(turn) for turn in turns_dict]
            tools_config = None
            if tools_config:
                self._extra_kwargs["tools"] = tools_config

            config = types.GenerateContentConfig(
                response_mime_type="text/plain"
            )

            stream = await self._client.aio.models.generate_content_stream(
                model=self._model,
                contents=cast(types.ContentListUnion, turns),
                config=config,
            )

            async for response in stream:
                if response.prompt_feedback:
                    raise APIStatusError(
                        response.prompt_feedback.json(),
                        retryable=False,
                        request_id=request_id,
                    )

                if (
                    not response.candidates
                    or not response.candidates[0].content
                    or not response.candidates[0].content.parts
                ):
                    continue

                for part in response.candidates[0].content.parts:
                    chat_chunk = self._parse_part(request_id, part)
                    if chat_chunk is not None:
                        retryable = False
                        self._event_ch.send_nowait(chat_chunk)

                if response.usage_metadata is not None:
                    usage = response.usage_metadata
                    self._event_ch.send_nowait(
                        llm.ChatChunk(
                            id=request_id,
                            usage=llm.CompletionUsage(
                                completion_tokens=usage.candidates_token_count or 0,
                                prompt_tokens=usage.prompt_token_count or 0,
                                prompt_cached_tokens=usage.cached_content_token_count or 0,
                                total_tokens=usage.total_token_count or 0,
                            ),
                        )
                    )

        except ClientError as e:
            raise APIStatusError(
                "gemini llm: client error",
                status_code=e.code,
                body=f"{e.message} {e.status}",
                request_id=request_id,
                retryable=False if e.code != 429 else True,
            ) from e
        except ServerError as e:
            raise APIStatusError(
                "gemini llm: server error",
                status_code=e.code,
                body=f"{e.message} {e.status}",
                request_id=request_id,
                retryable=retryable,
            ) from e
        except APIError as e:
            raise APIStatusError(
                "gemini llm: api error",
                status_code=e.code,
                body=f"{e.message} {e.status}",
                request_id=request_id,
                retryable=retryable,
            ) from e
        except Exception as e:
            raise APIConnectionError(
                f"gemini llm: error generating content {str(e)}",
                retryable=retryable,
            ) from e

    def _parse_part(self, id: str, part: types.Part) -> llm.ChatChunk | None:
        if part.function_call:
            chat_chunk = llm.ChatChunk(
                id=id,
                delta=llm.ChoiceDelta(
                    role="assistant",
                    tool_calls=[
                        llm.FunctionToolCall(
                            arguments=json.dumps(part.function_call.args),
                            name=part.function_call.name,  # type: ignore
                            call_id=part.function_call.id or utils.shortuuid("function_call_"),
                        )
                    ],
                    content=part.text,
                ),
            )
            return chat_chunk

        return llm.ChatChunk(
            id=id,
            delta=llm.ChoiceDelta(content=part.text, role="assistant"),
        )
