import heapq

# Licensed under the Creative Commons attribution-noncommercial-sharealike License by Giovanni Gherdovich
# Original version can be found at
# http://www.gghh.name/dibtp/2014/02/25/how-does-mercurial-select-the-greatest-common-ancestor.html


def depthf(a, b, pfunc):
    print(str(a) + '  ' + str(b))
    a, b = sorted([a, b])
    # find depth from root of all ancestors
    # depth is stored as a negative for heapq
    parentcache = {}
    visit = [a, b]
    depth = {}
    while visit:
        vertex = visit[-1]
        pl = pfunc(vertex)
        parentcache[vertex] = pl
        if not pl:
            depth[vertex] = 0
            visit.pop()
        else:
            for p in pl:
                if p not in depth:
                    visit.append(p)
            if visit[-1] == vertex:
                # -(maximum distance of parents + 1)
                depth[vertex] = min([depth[p] for p in pl]) - 1
                visit.pop()
    return depth, parentcache


def ancestors(vertex, depth, parentcache):
    h = [(depth[vertex], vertex)]
    seen = set()
    while h:
        d, n = heapq.heappop(h)
        if n not in seen:
            seen.add(n)
            yield (d, n)
            for p in parentcache[n]:
                heapq.heappush(h, (depth[p], p))


def generations(vertex, depth, parentcache):
    sg, s = None, set()
    for g, v in ancestors(vertex, depth, parentcache):
        if g != sg:
            if sg:
                yield sg, s
            sg, s = g, set((v,))
        else:
            s.add(v)
    yield sg, s


def gca(a, b, parents):
    pfunc = lambda x: parents[x]

    if a is None or b is None:
        return None

    depth, parentcache = depthf(a, b, pfunc)

    x = generations(a, depth, parentcache)
    y = generations(b, depth, parentcache)

    gx = x.__next__()
    gy = y.__next__()
    # increment each ancestor list until it is closer to root
    # than the other, or they match
    try:
        while True:
            if gx[0] == gy[0]:
                for v in gx[1]:
                    if v in gy[1]:
                        return v
                gy = y.__next__()
                gx = x.__next__()
            elif gx[0] > gy[0]:
                gy = y.__next__()
            else:
                gx = x.__next__()
    except StopIteration:
        return None