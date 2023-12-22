from channels.middleware import BaseMiddleware
from channels.auth import AuthMiddlewareStack

class CustomRoomIdMiddleware(BaseMiddleware):
    # def __init__(self, inner):
    #     # Store the ASGI application
    #     self.inner = inner
    
    def populate_scope(self, scope):
        # Make sure we have a session
        if "session" not in scope:
            raise ValueError(
                "AuthMiddleware cannot find session in scope. "
                "SessionMiddleware must be above it."
            )
        # Add it to the scope if it's not there already
        # if "url_route" not in scope:
        path = scope['path']
        path_segments = path.split('/')
        room_id = path_segments[-2]
        scope["url_route"] = {'args': (), 'kwargs':{'channels': [room_id]}}
            #'url_route': {'args': (), 'kwargs': {}}
        # else:
        #     print("inscope")
        
    async def __call__(self, scope, receive, send):
        scope = dict(scope)
        # Scope injection/mutation per this middleware's needs.
        self.populate_scope(scope)

        return await super().__call__(scope, receive, send)
    
def CustomRoomIdMiddlewareStack(inner):
    return AuthMiddlewareStack(CustomRoomIdMiddleware(inner))



#     async def __call__(self, scope, receive, send):
#         # Extract the room_id from the URL path
#         path = scope['path']
#         path_segments = path.split('/')
#         room_id = path_segments[-1]

#         # Store the room_id in the scope for later access
#         scope['channels'] = [room_id]

#         # Call the inner application
#         return await self.inner(scope, receive, send)





# class AuthMiddleware(BaseMiddleware):
#     """
#     Middleware which populates scope["user"] from a Django session.
#     Requires SessionMiddleware to function.
#     """

#     def populate_scope(self, scope):
#         # Make sure we have a session
#         if "session" not in scope:
#             raise ValueError(
#                 "AuthMiddleware cannot find session in scope. "
#                 "SessionMiddleware must be above it."
#             )
#         # Add it to the scope if it's not there already
#         if "user" not in scope:
#             scope["user"] = UserLazyObject()

#     async def resolve_scope(self, scope):
#         scope["user"]._wrapped = await get_user(scope)

#     async def __call__(self, scope, receive, send):
#         scope = dict(scope)
#         # Scope injection/mutation per this middleware's needs.
#         self.populate_scope(scope)
#         # Grab the finalized/resolved scope
#         await self.resolve_scope(scope)

#         return await super().__call__(scope, receive, send)