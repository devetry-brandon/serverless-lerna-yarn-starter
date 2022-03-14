export async function main(event, context) {
    return {
        statusCode: 200,
        body: `Hello World! This is a typescript handler.`,
    };
}