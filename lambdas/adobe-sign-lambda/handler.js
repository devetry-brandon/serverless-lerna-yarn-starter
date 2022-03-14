export const hello = async (event, context) => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: `Go Serverless v2.0! Your regular js function executed successfully!`,
        })
    };
};
