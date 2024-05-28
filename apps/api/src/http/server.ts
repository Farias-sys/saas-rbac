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
import { errorHandler } from './routes/error-handler';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);
app.setErrorHandler(errorHandler);
app.register(fastifyCors);

app.register(fastifySwagger, {
    openapi: {
        info: {
        title: 'RBAC SaaS API',
        description: 'API developed in Rocketseat Training',
        version: '1.0.0',
        },
        servers: [],
    },
    transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUI, {
    routePrefix: '/docs',
});

app.register(fastifyJwt,
    {
        secret: 'veryveryveryverysafe'
    }
)

app.register(createAccount)
app.register(authenticateWithPassword)

app.listen({port:5000}).then(() => {
    console.log('HTTP Server Running')
});