import {fastify} from 'fastify';
import fastifyCors from '@fastify/cors';

import {
    jsonSchemaTransform,
    serializerCompiler,
    validatorCompiler,
    ZodTypeProvider
} from 'fastify-type-provider-zod';
import { createAccount } from './routes/auth/create-account';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);
app.register(fastifyCors);

app.register(createAccount)

app.listen({port:5000}).then(() => {
    console.log('HTTP Server Running')
});