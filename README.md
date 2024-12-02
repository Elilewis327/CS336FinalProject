## Schema
The final schema should be something like this:


# Collections

## Users
**Document:** Auto Generate  
- `creation_time`: `timestamp`  
- `username`: `string`  
- `auth_info`: `idk`  

## FinalProjectChats
**Document:** Auto Generate  
- `chat_room_name`: `string`  
- `chats`: `map`  
  - `timestamp`: `timestamp`  
  - `sender`: `reference -> Users`  
  - `message`: `string`  
  - many chats per document