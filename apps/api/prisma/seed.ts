import {PrismaClient} from '@prisma/client';
import { hash } from 'bcryptjs';
import {faker} from '@faker-js/faker'

const prisma = new PrismaClient();

async function seed(){
    await prisma.organization.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    const user = await prisma.user.create({
        data: {
            name: 'John Doe',
            email: 'john@acme.com',
            avatarUrl: 'https://github.com/diego3g.png',
            passwordHash: await hash('123456', 1)
        }
    })
    const anotherUser = await prisma.user.create({
        data: {
            name: faker.person.fullName(),
            email: faker.internet.email(),
            avatarUrl: faker.image.avatarGitHub(),
            passwordHash: await hash('123456', 1)
        }
    })
    const AnotherUser2 = await prisma.user.create({
        data: {
            name: faker.person.fullName(),
            email: faker.internet.email(),
            avatarUrl: faker.image.avatarGitHub(),
            passwordHash: await hash('123456', 1)
        }
    })

    await prisma.organization.create({
        data: {
            name: 'Acme inc (Admin)',
            domain: 'acme.com',
            slug: 'acme-admin',
            avatarUrl: faker.image.avatarGitHub(),
            shouldAttachUsersByDomain: true,
            ownerId: user.id,
            projects: {
                createMany: {
                    data: [
                        {
                            name: faker.lorem.words(5),
                            slug: faker.lorem.words(5),
                            description: faker.lorem.paragraph(),
                            avatarUrl: faker.image.avatarGitHub(),
                            ownerId: faker.helpers.arrayElement([
                                user.id,
                                anotherUser.id,
                                AnotherUser2.id
                            ])
                        },
                        {
                            name: faker.lorem.words(5),
                            slug: faker.lorem.words(5),
                            description: faker.lorem.paragraph(),
                            avatarUrl: faker.image.avatarGitHub(),
                            ownerId: faker.helpers.arrayElement([
                                user.id,
                                anotherUser.id,
                                AnotherUser2.id
                            ])
                        },
                        {
                            name: faker.lorem.words(5),
                            slug: faker.lorem.words(5),
                            description: faker.lorem.paragraph(),
                            avatarUrl: faker.image.avatarGitHub(),
                            ownerId: faker.helpers.arrayElement([
                                user.id,
                                anotherUser.id,
                                AnotherUser2.id
                            ])
                        }
                    ]
                }
            },
            members: {
                createMany: {
                    data: [
                        {
                            userId: user.id,
                            role: 'ADMIN'
                        },
                        {
                            userId: anotherUser.id,
                            role: 'MEMBER'
                        },
                        {
                            userId: AnotherUser2.id,
                            role: 'MEMBER'
                        }
                    ]
                }
            }
        }
    })

    await prisma.organization.create({
        data: {
            name: 'Acme inc (Member)',
            slug: 'acme-member',
            avatarUrl: faker.image.avatarGitHub(),
            shouldAttachUsersByDomain: true,
            ownerId: user.id,
            projects: {
                createMany: {
                    data: [
                        {
                            name: faker.lorem.words(5),
                            slug: faker.lorem.words(5),
                            description: faker.lorem.paragraph(),
                            avatarUrl: faker.image.avatarGitHub(),
                            ownerId: faker.helpers.arrayElement([
                                user.id,
                                anotherUser.id,
                                AnotherUser2.id
                            ])
                        },
                        {
                            name: faker.lorem.words(5),
                            slug: faker.lorem.words(5),
                            description: faker.lorem.paragraph(),
                            avatarUrl: faker.image.avatarGitHub(),
                            ownerId: faker.helpers.arrayElement([
                                user.id,
                                anotherUser.id,
                                AnotherUser2.id
                            ])
                        },
                        {
                            name: faker.lorem.words(5),
                            slug: faker.lorem.words(5),
                            description: faker.lorem.paragraph(),
                            avatarUrl: faker.image.avatarGitHub(),
                            ownerId: faker.helpers.arrayElement([
                                user.id,
                                anotherUser.id,
                                AnotherUser2.id
                            ])
                        }
                    ]
                }
            },
            members: {
                createMany: {
                    data: [
                        {
                            userId: user.id,
                            role: 'ADMIN'
                        },
                        {
                            userId: anotherUser.id,
                            role: 'MEMBER'
                        },
                        {
                            userId: AnotherUser2.id,
                            role: 'MEMBER'
                        }
                    ]
                }
            }
        }
    })

    await prisma.organization.create({
        data: {
            name: 'Acme inc (Billing)',
            slug: 'acme-billing',
            avatarUrl: faker.image.avatarGitHub(),
            shouldAttachUsersByDomain: true,
            ownerId: user.id,
            projects: {
                createMany: {
                    data: [
                        {
                            name: faker.lorem.words(5),
                            slug: faker.lorem.words(5),
                            description: faker.lorem.paragraph(),
                            avatarUrl: faker.image.avatarGitHub(),
                            ownerId: faker.helpers.arrayElement([
                                user.id,
                                anotherUser.id,
                                AnotherUser2.id
                            ])
                        },
                        {
                            name: faker.lorem.words(5),
                            slug: faker.lorem.words(5),
                            description: faker.lorem.paragraph(),
                            avatarUrl: faker.image.avatarGitHub(),
                            ownerId: faker.helpers.arrayElement([
                                user.id,
                                anotherUser.id,
                                AnotherUser2.id
                            ])
                        },
                        {
                            name: faker.lorem.words(5),
                            slug: faker.lorem.words(5),
                            description: faker.lorem.paragraph(),
                            avatarUrl: faker.image.avatarGitHub(),
                            ownerId: faker.helpers.arrayElement([
                                user.id,
                                anotherUser.id,
                                AnotherUser2.id
                            ])
                        }
                    ]
                }
            },
            members: {
                createMany: {
                    data: [
                        {
                            userId: user.id,
                            role: 'ADMIN'
                        },
                        {
                            userId: anotherUser.id,
                            role: 'MEMBER'
                        },
                        {
                            userId: AnotherUser2.id,
                            role: 'MEMBER'
                        }
                    ]
                }
            }
        }
    })

}

seed().then(() => {
    console.log('Database seeded!')
})