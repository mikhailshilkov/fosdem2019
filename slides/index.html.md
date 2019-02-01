``` console
> pulumi up

Previewing update (urlshortener):

     Type                   Name             Plan
 +   pulumi:pulumi:Stack    urlshortener     create
 +    aws:dynamodb:Table    urls             create

Resources:
    + 2 to create

Do you want to perform this update? yes
Updating (urlshortener):

     Type                   Name             Status
 +   pulumi:pulumi:Stack    urlshortener     created
 +    aws:dynamodb:Table    urls             created

Resources:
    + 2 created
```





``` console
> pulumi up

Previewing update (urlshortener):

     Type                   Name             Plan
     pulumi:pulumi:Stack    urlshortener        
 ~   aws:dynamodb:Table     urls             update  [diff: ~readCapacity]

Resources:
    ~ 1 to update
    1 unchanged
```




``` console
Previewing update (fosdem-component-urlshortener):

     Type                                Name                  Plan
 +   pulumi:pulumi:Stack                 urlshortener          create
 +     my:Lambda                         lambda-get            create
 +       aws:iam:Role                    lambda-get-role       create
 +       aws:iam:RolePolicyAttachment    lambda-get-access     create
 +       aws:lambda:Function             lambda-get-func       create
 +     aws:dynamodb:Table                urls                  create
```

The `Endpoint` component simplifies definition of API Gateway (see [the source](todo)):