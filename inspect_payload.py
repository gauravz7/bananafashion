from google.genai import types
import pydantic

print("RecontextImageSource fields:")
try:
    print(types.RecontextImageSource.model_fields)
except:
    print(types.RecontextImageSource.__annotations__)

print("\nProductImage fields:")
try:
    print(types.ProductImage.model_fields)
except:
    print(types.ProductImage.__annotations__)
