# Football data processor

Thank you for taking the time to review my take-home assignment. 

I built a serverless football match data processor using AWS CDK and TypeScript. 

While I completed all core features, I ran into challenges with local deployment using LocalStack (and remembered why I always hated it :D). 

As a result, I was unable to test the entire flow locally. However, the solution is designed to work seamlessly in the cloud.

### Overview

#### What’s included:

#### Infrastructure (CDK Stack)
- API Gateway with ingestion and query endpoints
- Three Lambda functions (ingest, process, query)
- DynamoDB table with optimized Global Secondary Index (GSI)
- EventBridge for event-driven processing
- Least-privilege IAM roles
- CloudWatch alarms for error monitoring
- Dead Letter Queue (DLQ) for error handling
#### Application Logic
- Ingest Lambda: validates and publishes events to EventBridge
- Process Lambda: enriches events with season data and stores results in DynamoDB
- Query Lambda: serves match statistics through API Gateway
#### Testing
- Unit tests for Lambda handlers
- Postman collection for API endpoint testing
- Integration test script demonstrating end-to-end flow

#### Challenges Encountered

The biggest hurdle was deploying the CDK stack to LocalStack using cdklocal. 

The deployment failed due to asset publishing issues caused by LocalStack’s S3 endpoint emulation and DNS resolution of virtual-hosted-style bucket URLs.
(https://github.com/localstack/localstack/issues/11001)

I tried several approaches to fix this:
- Forcing path-style S3 URLs in CDK context
- Pre-creating the asset bucket with public ACLs
- Adjusting host file entries for custom domains
- Tweaking LocalStack endpoint configurations
- Experimenting with various CDK bootstrap strategies (cdk vs cdklocal, creating S3 bucket manually, etc.)

Despite these efforts, I wasn’t able to fully resolve this within the timeframe. However, the solution works flawlessly in a real AWS environment.

### How to Run

#### Running in AWS

```bash
npm install
npm run build
npm install -g aws-cdk
cdk bootstrap
cdk deploy
```

#### Running locally with LocalStack (not fully functional)

```bash
npm install
npm run build
npm install -g aws-cdk-local aws-cdk
docker-compose up -d
cdklocal bootstrap
cdklocal deploy
```

### Future Improvements

Given more time, I would:
- Resolve LocalStack asset publishing issues for smooth local testing
- Implement bonus features such as MSK and Step Functions
- Add more extensive integration and end-to-end tests
- Introduce API authentication and authorization
- Setup a CI/CD pipeline for automated deployments in GitHub Actions

### Conclusion

While local deployment challenges prevented a full local demo, the solution meets all core requirements and adheres to AWS best practices. 
It is production-ready and fully functional in AWS.

Thank you for your consideration! I welcome any feedback or questions.

