import * as aws from "@pulumi/aws";

// A DynamoDB table with a single primary key
let counterTable = new aws.dynamodb.Table("urls", {
    name: "urls",
    attributes: [
        { name: "name", type: "S" },
    ],
    hashKey: "name",
    readCapacity: 1,
    writeCapacity: 1
});