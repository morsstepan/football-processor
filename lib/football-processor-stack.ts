import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { aws_cloudwatch, aws_lambda_destinations, aws_sqs, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class FootballProcessorStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table with optimized GSI
    const table = new dynamodb.Table(this, 'MatchEventsTable', {
      partitionKey: {name: 'PK', type: dynamodb.AttributeType.STRING},
      sortKey: {name: 'SK', type: dynamodb.AttributeType.STRING},
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    table.addGlobalSecondaryIndex({
      indexName: 'EventTypeIndex',
      partitionKey: {name: 'GSI1PK', type: dynamodb.AttributeType.STRING},
      sortKey: {name: 'GSI1SK', type: dynamodb.AttributeType.STRING},
    });

    // EventBridge Bus
    const bus = new events.EventBus(this, 'MatchEventBus', {
      eventBusName: 'MatchEventBus',
    });

    // Lambda Functions
    const ingestHandler = new lambda.Function(this, 'IngestHandler', {
      runtime: lambda.Runtime.NODEJS_22_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'ingest.handler',
      environment: {
        EVENT_BUS_NAME: bus.eventBusName,
      },
    });

    const processHandler = new lambda.Function(this, 'ProcessHandler', {
      runtime: lambda.Runtime.NODEJS_22_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'process.handler',
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    const queryHandler = new lambda.Function(this, 'QueryHandler', {
      runtime: lambda.Runtime.NODEJS_22_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'query.handler',
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    // DLQ for processing errors
    const dlq = new aws_sqs.Queue(this, 'ProcessDLQ');
    processHandler.configureAsyncInvoke({
      onFailure: new aws_lambda_destinations.SqsDestination(dlq)
    });



    // EventBridge Rule
    new events.Rule(this, 'MatchEventsRule', {
      eventBus: bus,
      eventPattern: {
        source: ['football.ingest'],
      },
      targets: [new targets.LambdaFunction(processHandler)],
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'MatchApi', {
      deployOptions: {
        tracingEnabled: true,
      },
    });

    // Cloudwatch
    const errorsMetric = processHandler.metricErrors();
    new aws_cloudwatch.Alarm(this, 'ProcessErrorsAlarm', {
      metric: errorsMetric,
      threshold: 1,
      evaluationPeriods: 1,
      alarmDescription: 'Processing Lambda errors',
    });

    // Enable Lambda Insights
    // Is commented out because it is a paid feature in Localstack. :(
    // processHandler.addLayers(lambda.LayerVersion.fromLayerVersionArn(
    //   this, 'LambdaInsights',
    //   `arn:aws:lambda:${this.region}:580247275435:layer:LambdaInsightsExtension:22`
    // ));

    // Ingest endpoint: POST /ingest
    const ingestResource = api.root.addResource('ingest');
    ingestResource.addMethod('POST', new apigateway.LambdaIntegration(ingestHandler));

    // Query endpoints: GET /matches/{matchId}/goals and /matches/{matchId}/passes
    const matchResource = api.root.addResource('matches');
    const matchIdResource = matchResource.addResource('{matchId}');
    matchIdResource.addResource('goals').addMethod('GET', new apigateway.LambdaIntegration(queryHandler));
    matchIdResource.addResource('passes').addMethod('GET', new apigateway.LambdaIntegration(queryHandler));

    // IAM Permissions (Least Privilege)
    bus.grantPutEventsTo(ingestHandler);
    table.grantWriteData(processHandler);
    table.grantReadData(queryHandler);
  }
}
