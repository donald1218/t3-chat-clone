import os
import asyncio
import sys
from livekit import rtc
from faster_whisper import WhisperModel
import torch
import numpy as np
import dotenv
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    RunContext,
    WorkerOptions,
    cli,
    function_tool,
)
from livekit.plugins import openai, silero, google, langchain
from livekit.rtc import Room
from langgraph.graph import StateGraph
from lang_graph import LLM, LLMStream

dotenv.load_dotenv()

# from dia.model import Dia

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger("VoiceBot")

# executor = ThreadPoolExecutor(max_workers=os.cpu_count() or 4)

# asr_model = WhisperModel("small", device="cuda" if torch.cuda.is_available() else "cpu")

# dia_agent = None 
# try:
#     dia_agent = Dia.from_pretrained("nari-labs/Dia-1.6B", compute_dtype="float16")
#     logger.info("✨ Dia Agent initialized successfully.")
# except Exception as e:
#     logger.error(f"Failed to initialize Dia Agent: {e}. Please ensure the model is downloaded and compatible.")
#     logger.info("Dia functionality will be skipped.")




async def entrypoint(ctx: JobContext):
    await ctx.connect()
    _base_url = os.getenv("SPEACHES_URL")
    if base_url is None:
        base_url = "http://localhost:8000/v1"
        
    session = AgentSession(
        vad=silero.VAD.load(),
        # any combination of STT, LLM, TTS, or realtime API can be used
        stt=openai.STT(model="Systran/faster-distil-whisper-small.en", base_url=_base_url, api_key="1234567890"),
        tts=openai.TTS(model="speaches-ai/Kokoro-82M-v1.0-ONNX", voice="af_heart",speed=1.0, base_url=_base_url, api_key="1234567890"),
    )
    

    
    _google_api_key = os.getenv("GOOGLE_API_KEY")
    _first_participant = list(ctx.room.remote_participants.values())[0]
    _chosen_model = _first_participant.attributes["model"]
    if _chosen_model is None:
        _chosen_model = "gemma-3-27b-it"
        
    print("chosen model", _chosen_model)

    await session.start(
        room=ctx.room,
        agent=Agent(
            instructions="You are a friendly voice assistant built by LiveKit. Your output will be in the voice of the user. Formatted output or Emoji are not allowed.",
            llm=LLM(
            model=_chosen_model,
            api_key=_google_api_key,
        )),
    )
    await session.generate_reply(instructions="greet the user and ask about their day after receiving '.' from the user")
    

if __name__ == "__main__":
    _api_key = os.getenv("LIVEKIT_API_KEY")
    _api_secret = os.getenv("LIVEKIT_SECRET")
    _google_api_key = os.getenv("GOOGLE_API_KEY")
    if _google_api_key is None:
        print("Google API key is required for Google API either via GOOGLE_API_KEY environment variable or api_key parameter")
        sys.exit(0)
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, api_key=_api_key, api_secret=_api_secret))