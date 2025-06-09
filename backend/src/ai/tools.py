TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "rag_agent_tool",
            "description": "Retrieves relevant information from the documents uploaded by the user",
            "strict": True,
            "parameters": {
                "type": "object",
                "properties": {
                    "user_query": {
                        "type": "string",
                        "description": "user query to retrieve information from the documents uploaded by the user",
                    },  
                },
                "required": ["user_query"],
                "additionalProperties": False,
            },
        },
    },
]   