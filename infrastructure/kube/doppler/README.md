run deploy.sh on selected context
create service account in doppler
create service account secret with the following command

```
kubectl create secret generic doppler-token-secret \
  --namespace doppler-operator-system \
  --from-literal=serviceToken=dp.st.dev.XXXX
```

apply the correct cluster
