import {fastify} from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import fastifyJwt from '@fastify/jwt';

import {
    jsonSchemaTransform,
    serializerCompiler,
    validatorCompiler,
    ZodTypeProvider
} from 'fastify-type-provider-zod';
import { createAccount } from './routes/auth/create-account';
import { authenticateWithPassword } from './routes/auth/authenticate-with-password';
import {authenticateWithGithub} from './routes/auth/authenticate-with-github';
import { errorHandler } from './routes/error-handler';
import { requestPasswordRecover } from './routes/auth/request-password-recover';
import { resetPassword } from './routes/auth/reset-password';
import { getProfile } from './routes/auth/get-profile';
import { env } from '../../../../packages/env';
import { createOrganization } from './routes/orgs/create-organization';
import { getMembership } from './routes/orgs/get-membership';
import { getOrganization } from './routes/orgs/get-organization';
import { getOrganizations } from './routes/orgs/get-organizations';
import { updateOrganization } from './routes/orgs/update-organization';
import { shutdownOrganization } from './routes/orgs/shutdown-organization';
import { transferOrganization } from './routes/orgs/transfer-organization';
import { createProject } from './routes/projects/create-project';
import { deleteProject } from './routes/projects/delete-project';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);
app.setErrorHandler(errorHandler);

app.register(fastifySwagger, {
    openapi: {
        info: {
            title: 'RBAC SaaS API',
            description: 'API developed in Rocketseat Training',
            version: '1.0.0',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUI, {
    routePrefix: '/docs',
});

app.register(fastifyJwt,
    {
        secret: env.JWT_SECRET
    }
)

app.register(fastifyCors);

app.register(createAccount);
app.register(authenticateWithPassword);
app.register(authenticateWithGithub);
app.register(requestPasswordRecover);
app.register(getProfile);
app.register(resetPassword);
app.register(createOrganization);
app.register(getMembership);
app.register(getOrganization);
app.register(getOrganizations);
app.register(updateOrganization);
app.register(shutdownOrganization);
app.register(transferOrganization);
app.register(createProject);
app.register(deleteProject);

app.listen({port:env.SERVER_PORT}).then(() => {
    console.log('HTTP Server Running')
});