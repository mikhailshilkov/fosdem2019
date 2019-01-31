const aws = require('aws-sdk');
const table = new aws.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const name = event.path.substring(1);
    if (!name) {
       return { statusCode: 404, body: JSON.stringify(event) };
    }

    const params = {
        TableName: "urls",
        Key: { "name": name }
    };

    const value = await table.get(params).promise();
    const url = value && value.Item && value.Item.url;

    // If we found an entry, 301 redirect to it; else, 404.
    return url 
       ? { statusCode: 301, body: "", headers: { "Location": url } }
       : { statusCode: 404, body: name + " not found" };
};
