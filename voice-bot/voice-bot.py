import os
import sys
import dotenv
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    WorkerOptions,
    cli,
)
from livekit.plugins import openai, silero
from lang_graph import LLM

dotenv.load_dotenv()


async def entrypoint(ctx: JobContext):
    await ctx.connect()
    _base_url = os.getenv("SPEACHES_URL")
    if _base_url is None:
        _base_url = "http://localhost:8000/v1"
        
    session = AgentSession(
        vad=silero.VAD.load(),
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