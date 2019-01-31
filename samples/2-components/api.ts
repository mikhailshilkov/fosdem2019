import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { Output } from "@pulumi/pulumi";

// Create the Swagger spec for a proxy which forwards all HTTP requests through to the Lambda function.
function swaggerSpec(path: string, lambdaArn: string): string {
    let swaggerSpec = {
        swagger: "2.0",
        info: { title: "api", version: "1.0" },
        paths: {
            path: swaggerRouteHandler(lambdaArn),
        },
    };
    return JSON.stringify(swaggerSpec);
}

// Create a single Swagger spec route handler for a Lambda function.
function swaggerRouteHandler(lambdaArn: string) {
    let region = aws.config.requireRegion();
    return {
        "x-amazon-apigateway-any-method": {
            "x-amazon-apigateway-integration": {
                uri: `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/${lambdaArn}/invocations`,
                passthroughBehavior: "when_no_match",
                httpMethod: "POST",
                type: "aws_proxy",
            },
        }
    };
}

export interface EndpointOptions {
    readonly path: string;
    readonly lambda: aws.lambda.Function;
}

export class Endpoint extends pulumi.ComponentResource {
    public readonly invokeUrl: Output<string>;

    constructor(name: string,
        options: EndpointOptions,
        opts?: pulumi.ResourceOptions) {
        
        super("fosdem:Endpoint", name, opts);

        // Create the API Gateway Rest API, using a swagger spec.
        const restApi = new aws.apigateway.RestApi(`${name}-api`, {
            body: options.lambda.arn.apply(lambdaArn => swaggerSpec(options.path, lambdaArn)),
        }, { parent: this });

        // Create a deployment of the Rest API.
        const deployment = new aws.apigateway.Deployment(`${name}-deployment`, {
            restApi: restApi,
            // Note: Set to empty to avoid creating an implicit stage, we'll create it explicitly below instead.
            stageName: "", 
        }, { parent: this });

        const stageName = "api";

        // Create a stage, which is an addressable instance of the Rest API. Set it to point at the latest deployment.
        const stage = new aws.apigateway.Stage(`${name}-stage`, { 
            restApi: restApi,
            deployment: deployment,
            stageName: stageName
        }, { parent: this });

        // Give permissions from API Gateway to invoke the Lambda
        new aws.lambda.Permission(`${name}-permission`, {
            action: "lambda:invokeFunction",
            function: options.lambda,
            principal: "apigateway.amazonaws.com",
            sourceArn: deployment.executionArn.apply(arn => arn + "*/*"),
        }, { parent: this });

        this.invokeUrl = deployment.invokeUrl.apply(url => url + stageName);
    }
}