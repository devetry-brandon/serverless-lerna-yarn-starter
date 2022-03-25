variable "tags" {
  type        = map(string)
  description = "ASU Standard Tags"
}

variable "vpc_name" {
  type        = string
  description = "VPC Name"
}

variable "environment_variables" {
  type        = map(string)
  description = "Map of Lambda environment variables"
  default     = {}
}

variable "product_codes" {
  type        = string
  description = "Product codes used for naming resources"
}