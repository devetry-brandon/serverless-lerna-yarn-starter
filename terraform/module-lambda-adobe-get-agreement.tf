module "lambda_adobe_get_agreement" {
  source = "./lambda-command"

  lambda_name           = "adobe-get-agreement"
  lambda_dir            = "../lambdas/adobe-sign-api"
  controller            = "agreements-controller"
  handler               = "getAgreement"
  product_codes         = var.product_codes
  vpc_name              = var.vpc_name
  tags                  = var.tags
  environment_variables = var.environment_variables
}
