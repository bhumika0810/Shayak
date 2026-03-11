from llama_cpp import Llama
import os

MODEL_PATH = "models/gemma-2b-it-q4_k_m.gguf"
CONTEXT_SIZE = 2048

class LLMService:
    def __init__(self):
        self.llm = None
        if os.path.exists(MODEL_PATH):
            print(f"Loading LLM from {MODEL_PATH}...")
            try:
                self.llm = Llama(
                    model_path=MODEL_PATH,
                    n_ctx=CONTEXT_SIZE,
                    n_threads=4
                )
                print("LLM loaded successfully.")
            except Exception as e:
                print(f"Failed to load LLM: {e}")
        else:
            print(f"Warning: LLM model not found at {MODEL_PATH}. Using mock response.")

    def generate(self, prompt: str, max_tokens: int = 128) -> str:
        if not self.llm:
            return f"Mock Response: I need the model file at '{MODEL_PATH}' to generate real responses. Query: {prompt}"

        try:
            output = self.llm(
                f"<start_of_turn>user\n{prompt}<end_of_turn>\n<start_of_turn>model\n",
                max_tokens=max_tokens,
                stop=["<end_of_turn>", "User:", "System:"],
                echo=False
            )
            return output['choices'][0]['text'].strip()
        except Exception as e:
            print(f"Generation error: {e}")
            return f"Error during generation: {str(e)}"

llm_service = LLMService()

def generate_response(prompt: str) -> str:
    return llm_service.generate(prompt)