variable "lambda_name" {
  type        = string
  description = "Lambda function name"
}

variable "lambda_dir" {
  type        = string
  description = "Working directory of the lambda"
}

variable "controller" {
  type        = string
  description = "Controller that the handler resides"
}

variable "handler" {
  type        = string
  description = "Handler function for the lambda"
}

variable "tags" {
  type        = map(string)
  description = "ASU Standard Tags"
  default     = {}
}

variable "vpc_name" {
  type        = string
  description = "VPC Name"
}

variable "product_codes" {
  type        = string
  description = "Product codes used for naming resources"
}

variable "iam_roles" {
  type        = list(string)
  description = "IAM Roles the function is allowed to assume"
  default     = []
}

variable "environment_variables" {
  type        = map(string)
  description = "Map of Lambda environment variables"
  default     = {}
}
