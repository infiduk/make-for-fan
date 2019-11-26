# chaincode install
docker exec cli peer chaincode install -n sacc -v 0.1 -p github.com/sacc
sleep 5

# chaincode instatiate
docker exec cli peer chaincode instantiate -n sacc -v 0.1 -C mychannel -c '{"Args":[]}' -P 'OR ("Org1MSP.member", "Org2MSP.member","Org3MSP.member")'
# docker exec cli peer chaincode upgrade -n sacc -v 0.2 -C mychannel -c '{"Args":[]}' -P 'OR ("Org1MSP.member", "Org2MSP.member","Org3MSP.member")'
sleep 5