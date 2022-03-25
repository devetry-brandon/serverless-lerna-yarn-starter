data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${var.product_codes}-${var.lambda_name}"
  retention_in_days = 14

  tags = merge(
    var.tags,
    {
      Name = "${var.product_codes}-${var.lambda_name}",
    },
  )
}

resource "aws_iam_role" "lambda" {
  name               = "${var.product_codes}-${var.lambda_name}-Lambda-${data.aws_region.current.name}"
  description        = "Role for Lambda function ${var.product_codes}-${var.lambda_name}"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

data "aws_iam_policy_document" "assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "lambda" {
  statement {
    effect = "Allow"
    actions = [
      "secretsmanager:GetResourcePolicy",
      "secretsmanager:GetSecretValue",
      "secretsmanager:DescribeSecret",
      "secretsmanager:ListSecretVersionIds",
      "secretsmanager:ListSecrets"
    ]

    resources = [
      "*"
    ]
  }
}

resource "aws_iam_policy" "lambda" {
  name   = "${var.product_codes}-${var.lambda_name}-Lambda-${data.aws_region.current.name}"
  policy = data.aws_iam_policy_document.lambda.json
}

resource "aws_iam_role_policy_attachment" "lambda" {
  role       = aws_iam_role.lambda.name
  policy_arn = aws_iam_policy.lambda.arn
}

resource "aws_iam_role_policy_attachment" "lambda_basicexecution" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "null_resource" "mono_repo_install_and_compile" {
  provisioner "local-exec" {
    working_dir = "./"
    command = "yarn && yarn run lerna run tsc"
  }
}

resource "null_resource" "lambda_build" {
  provisioner "local-exec" {
    working_dir = "${var.lambda_dir}"
    command = "yarn run webpack --mode=production"
  }

  depends_on = [
    null_resource.mono_repo_install_and_compile
  ]
}

data "archive_file" "lambda_zip" {
  type = "zip"
  source_dir = "${var.lambda_dir}/dist"
  output_path = "${var.lambda_dir}/${var.controller}.zip"

  depends_on = [
    null_resource.lambda_build
  ]
}

resource "aws_lambda_function" "lambda" {
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  function_name    = "${var.product_codes}-${var.lambda_name}"
  handler          = "${var.controller}.${var.handler}"
  description      = "${var.controller}.${var.handler} Lambda"
  role             = aws_iam_role.lambda.arn
  runtime          = "nodejs14.x"
  memory_size      = 128
  timeout          = 30

  depends_on = [
    data.archive_file.lambda_zip
  ]

  environment {
    variables = var.environment_variables
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.product_codes}-${var.lambda_name}",
    },
  )
}
