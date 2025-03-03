from channels.middleware import BaseMiddleware
from channels.auth import AuthMiddlewareStack


class CustomRoomIdMiddleware(BaseMiddleware):
    def populate_scope(self, scope):
        # Make sure we have a session
        if "session" not in scope:
            raise ValueError(
                "AuthMiddleware cannot find session in scope. "
                "SessionMiddleware must be above it."
            )
        # Add it to the scope if it's not there already
        # if "url_route" not in scope:
        path = scope["path"]
        path_segments = path.split("/")
        room_id = path_segments[-2]
        scope["url_route"] = {"args": (), "kwargs": {"channels": [room_id]}}

    async def __call__(self, scope, receive, send):
        scope = dict(scope)
        # Scope injection/mutation per this middleware's needs.
        self.populate_scope(scope)

        return await super().__call__(scope, receive, send)


def CustomRoomIdMiddlewareStack(inner):
    return AuthMiddlewareStack(CustomRoomIdMiddleware(inner))
