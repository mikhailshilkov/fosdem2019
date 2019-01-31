import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Create a Role giving our Lambda access.
const policy: aws.iam.PolicyDocument = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": "sts:AssumeRole",
            "Principal": {
                "Service": "lambda.amazonaws.com",
            },
            "Effect": "Allow",
            "Sid": "",
        },
    ],
};

export interface LambdaOptions {
    readonly path: string;
    readonly file: string;
    
    readonly environment?:  pulumi.Input<{
        [key: string]: pulumi.Input<string>;
    }>;    
}

export class Lambda extends pulumi.ComponentResource {
    public readonly lambda: aws.lambda.Function;

    constructor(name: string,
        options: LambdaOptions,
        opts?: pulumi.ResourceOptions) {
        
        super("fosdem:Lambda", name, opts);

        const role = new aws.iam.Role(`${name}-role`, {
            assumeRolePolicy: JSON.stringify(policy),
        }, { parent: this });

        const fullAccess = new aws.iam.RolePolicyAttachment(`${name}-access`, {
            role: role,
            policyArn: aws.iam.AWSLambdaFullAccess,
        }, { parent: this });
        
        // Create a Lambda function, using code from the `./app` folder.
        this.lambda = new aws.lambda.Function(`${name}-func`, {
            runtime: aws.lambda.NodeJS8d10Runtime,
            code: new pulumi.asset.AssetArchive({
                ".": new pulumi.asset.FileArchive(options.path),
            }),
            timeout: 300,
            handler: `${options.file}.handler`,
            role: role.arn,
            environment: {
                variables: options.environment
            }
        }, { dependsOn: [fullAccess], parent: this });
    }
}