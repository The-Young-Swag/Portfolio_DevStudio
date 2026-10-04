import { checkServerEnv } from "./_lib/env.js";

import { GET as projectsGET, POST as projectsPOST } from "./_routes/projects/index.js";
import {
    DELETE as projectDELETE,
    PUT as projectPUT,
} from "./_routes/projects/[id].js";
import {
    GET as certificationsGET,
    POST as certificationsPOST,
} from "./_routes/certifications/index.js";
import {
    DELETE as certificationDELETE,
    PUT as certificationPUT,
} from "./_routes/certifications/[id].js";
import { GET as experienceGET, POST as experiencePOST } from "./_routes/experience/index.js";
import {
    DELETE as experienceDELETE,
    PUT as experiencePUT,
} from "./_routes/experience/[id].js";
import {
    GET as stackItemsGET,
    POST as stackItemsPOST,
} from "./_routes/stack-items/index.js";
import {
    DELETE as stackItemDELETE,
    PUT as stackItemPUT,
} from "./_routes/stack-items/[id].js";
import {
    GET as socialLinksGET,
    POST as socialLinksPOST,
} from "./_routes/social-links/index.js";
import {
    DELETE as socialLinkDELETE,
    PUT as socialLinkPUT,
} from "./_routes/social-links/[id].js";
import { GET as profileGET, PUT as profilePUT } from "./_routes/profile/index.js";
import { GET as sessionGET } from "./_routes/admin/session.js";
import { POST as imagesPOST } from "./_routes/images/index.js";
import { GET as imageGET } from "./_routes/images/[id].js";
import { POST as filesPOST } from "./_routes/files/index.js";
import { GET as fileGET } from "./_routes/files/[id].js";

type Handler = (request: Request) => Promise<Response>;

type ResourceRoutes = {
    collection: Partial<Record<string, Handler>>;
    item: Partial<Record<string, Handler>>;
};

const ROUTES: Record<string, ResourceRoutes> = {
    projects: {
        collection: { GET: () => projectsGET(), POST: projectsPOST },
        item: { PUT: projectPUT, DELETE: projectDELETE },
    },
    certifications: {
        collection: { GET: () => certificationsGET(), POST: certificationsPOST },
        item: { PUT: certificationPUT, DELETE: certificationDELETE },
    },
    experience: {
        collection: { GET: () => experienceGET(), POST: experiencePOST },
        item: { PUT: experiencePUT, DELETE: experienceDELETE },
    },
    "stack-items": {
        collection: { GET: () => stackItemsGET(), POST: stackItemsPOST },
        item: { PUT: stackItemPUT, DELETE: stackItemDELETE },
    },
    "social-links": {
        collection: { GET: () => socialLinksGET(), POST: socialLinksPOST },
        item: { PUT: socialLinkPUT, DELETE: socialLinkDELETE },
    },
    profile: {
        collection: { GET: () => profileGET(), PUT: profilePUT },
        item: {},
    },
    "admin/session": {
        collection: { GET: sessionGET },
        item: {},
    },
    images: {
        collection: { POST: imagesPOST },
        item: { GET: imageGET },
    },
    files: {
        collection: { POST: filesPOST },
        item: { GET: fileGET },
    },
};

const METHOD_ORDER = ["GET", "POST", "PUT", "DELETE"];

function notFound(): Response {
    return Response.json({ error: "Not found" }, { status: 404 });
}

function methodNotAllowed(resource: ResourceRoutes): Response {
    const allowed = METHOD_ORDER.filter(
        (method) =>
            resource.collection[method] !== undefined ||
            resource.item[method] !== undefined,
    );

    return Response.json(
        { error: `Method not allowed. Allowed: ${allowed.join(", ")}` },
        { status: 405, headers: { Allow: allowed.join(", ") } },
    );
}

async function dispatch(request: Request, method: string): Promise<Response> {
    const envError = checkServerEnv();

    if (envError) {
        return envError;
    }

    const parts = new URL(request.url).pathname.split("/").filter(Boolean);

    if (parts[0] === "api") {
        parts.shift();
    }

    let resource: ResourceRoutes | undefined;
    let isItem = false;

    if (parts.length === 2) {
        resource = ROUTES[`${parts[0]}/${parts[1]}`];

        if (resource === undefined) {
            resource = ROUTES[parts[0]];
            isItem = true;
        }
    } else if (parts.length === 1) {
        resource = ROUTES[parts[0]];
    } else {
        return notFound();
    }

    if (resource === undefined) {
        return notFound();
    }

    const handler = isItem ? resource.item[method] : resource.collection[method];

    if (!handler) {
        return methodNotAllowed(resource);
    }

    return handler(request);
}

export function GET(request: Request): Promise<Response> {
    return dispatch(request, "GET");
}

export function POST(request: Request): Promise<Response> {
    return dispatch(request, "POST");
}

export function PUT(request: Request): Promise<Response> {
    return dispatch(request, "PUT");
}

export function DELETE(request: Request): Promise<Response> {
    return dispatch(request, "DELETE");
}
