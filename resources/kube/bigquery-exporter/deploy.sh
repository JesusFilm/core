docker build . -t 894231352815.dkr.ecr.us-east-2.amazonaws.com/jfp-bqexport:latest
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 894231352815.dkr.ecr.us-east-2.amazonaws.com
docker push 894231352815.dkr.ecr.us-east-2.amazonaws.com/jfp-bqexport:latest
kubectl apply -f bigquery-exporter-deployment.yaml