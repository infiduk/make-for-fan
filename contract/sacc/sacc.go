/*
 * Copyright IBM Corp All Rights Reserved
 *
 * SPDX-License-Identifier: Apache-2.0
 */

package main

import (
	"encoding/json"
	"fmt"
	"strconv" 		// 문자열 숫자 변환
	"strings" 		// 문자열 포함 검사
	"bytes"
	"time"	  		// Timestamp
	"math/rand"		// Random
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"github.com/hyperledger/fabric/protos/peer"
)

// 체인코드에서 발생되는 모든 데이터가 저장되는 공간
type SimpleAsset struct {
}

// 회원 클래스
type User struct {
	ObjectType	string `json:"docType"`
	Id			string `json:"id"`		 // 회원 식별값
	Name		string `json:"name"`	 // 서비스에서 사용할 이름
	Birth		string `json:"birth"`	 // 출생 년도
	Gender		string `json:"gender"`	 // 성별
	Token		string `json:"token"`	 // 투표권
	Votes	 	string `json:"votes"`    // 참여한 투표 title
	Choices		string `json:"choices"`  // 선택 항목
	Values		string `json:"values"`	 // 투표에 사용한 토큰 수
}

// 투표 클래스 (World State에 담기는 정보)
type Vote struct {
	ObjectType	string `json:"docType"`  // CouchDB의 인덱스 기능을 쓰기위한 파라미터, 이 오브젝트 타입에 만든 구조체 이름을 넣으면 인덱스를 찾을 수 있음
	Id			string `json:"id"` 	 	 // 투표 식별값
	Category	string `json:"category"` // 투표 종류 0: 무료 / 1: 유료
	Title   	string `json:"title"` 	 // 투표 제목
	Begin		string `json:"begin"`	 // 시작 시간
	End			string `json:"end"`	 	 // 종료 시간
	Choice1  	string `json:"choice1"`  // 선택지 1
	Count1	 	string `json:"count1"`   // 선택지 1의 득표 수
	Users1		string `json:"users1"`	 // 1 선택한 User 리스트
	Values1		string `json:"values1"`	 // 투표에 사용한 토큰 수
	Choice2		string `json:"choice2"`  // 선택지 2
	Count2		string `json:"count2"`	 // 선택지 2의 득표 수
	Users2		string `json:"users2"`	 // 2 선택한 User 리스트
	Values2		string `json:"values2"`	 // 투표에 사용한 토큰 수
	Result		string `json:"result"`	 // 결과
	Status		string `json:"status"`	 // 0: 생성, 1: 진행 중, 2: 종료
	Reward		string `json:"reward"`	 // 보상으로 지급되는 토큰
	Winner		string `json:"winner"`	 // 당첨자
}

// 초기화 함수
func (t *SimpleAsset) Init(stub shim.ChaincodeStubInterface) peer.Response {
	// nil = null을 의미한다. 이는 0으로 초기화 되어 있거나 한 것이 아닌 진짜 비어있는 값이다.
	return shim.Success(nil)
}
 
// 호출할 함수를 식별하는 함수
func (t *SimpleAsset) Invoke(stub shim.ChaincodeStubInterface) peer.Response {
	// 함수 이름과, args를 분리하여 저장한다.
	fn, args := stub.GetFunctionAndParameters()

	var result string
	var err error
	if fn == "setUser" {
		result, err = setUser(stub, args)
	} else if fn == "getUser" {
		result, err = getUser(stub, args)
	} else if fn == "getUserByName" {
		result, err = getUserByName(stub, args)
	} else if fn == "getAllUsers" {
		result, err = getAllUsers(stub)
	} else if fn == "setVote" {				// Vote 생성
		result, err = setVote(stub, args)
	} else if fn == "getVote" {				// 종료(Status: 2)인 경우에만 Count값 Return 할 것
		result, err = getVote(stub, args) 
	} else if fn == "getVoteByStatus" {
		result, err = getVoteByStatus(stub, args)
	} else if fn == "getAllVotes" {			// for test
		result, err = getAllVotes(stub)
	} else if fn == "changeVoteStatus" {	// 시간 정보에 따라 Status 변경
		result, err = changeVoteStatus(stub, args)
	} else if fn == "choice" {				// 선택
		result, err = choice(stub, args)
	} else if fn == "getHistoryByVoteId" {
		result, err = getHistoryByVoteId(stub, args)
	} else {
		return shim.Error("Not supported chaincode function.")
	}
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success([]byte(result))
}

/* --------------------------------------- USER --------------------------------------- */
func setUser(stub shim.ChaincodeStubInterface, args []string) (string, error) {
	if len(args) != 4 {
		return "", fmt.Errorf("Incorrect arguments. Please input 4 args.")
	}

	// 아이디 중복 검사
	getUserByNameResult, _ := getUserByName(stub, []string{args[1]})
	if getUserByNameResult != "" {
		return "", fmt.Errorf("This name already exist.")
	}

	// 키 중복 검사
	getUserResult, _ := stub.GetState(args[0])
	if getUserResult != nil {
		return "", fmt.Errorf("This user already exist.")
	}

	var user = User {
		ObjectType: "User",
		Id:			args[0],
		Name:		args[1],
		Birth:		args[2],
		Gender:		args[3],
		Token:		"300",
		Votes:		"",
		Choices:	"",
		Values:		"",
	}

	userAsBytes, _ := json.Marshal(user)

	err := stub.PutState(args[0], userAsBytes)
	if err != nil {
		return "", fmt.Errorf("Failed to set asset: %s", err);
	}

	nameIdIndexKey, err := stub.CreateCompositeKey("name~id", []string{user.Name, user.Id})
	if err != nil {
		return "", fmt.Errorf("Failed to set composite key 'name~id': %s", err)
	}
	
	userIdIndexKey, err := stub.CreateCompositeKey("user~id", []string{user.ObjectType, user.Id})
	if err != nil {
		return "", fmt.Errorf("Failed to set composite key 'user~id': %s", err)
	}

	// value 에 비어있는 바이트 배열 생성
	value := []byte{0x00}
	
	stub.PutState(nameIdIndexKey, value)
	stub.PutState(userIdIndexKey, value)
	
	return string(userAsBytes), nil
}

func getUser(stub shim.ChaincodeStubInterface, args []string) (string, error) {
	if len(args) != 1 {
		return "", fmt.Errorf("Incorrect arguments. Expecting a key.")
	}
	id := args[0]
	userAsBytes, err := stub.GetState(id)
	if err != nil {
		return "", fmt.Errorf("User does not exist: %s", err)
	}

	return string(userAsBytes), nil
}

func getUserByName(stub shim.ChaincodeStubInterface, args []string) (string, error) {
	if len(args) != 1 {
		return "", fmt.Errorf("Incorrect arguments. Expecting a key.")
	}
	name := args[0]
	queriedIdByNameIterator, err := stub.GetStateByPartialCompositeKey("name~id", []string{name})
	if err != nil {
		return "", fmt.Errorf("Failed to get state by partial composite key 'name~id': %s", err)
	}
	defer queriedIdByNameIterator.Close()

	var result []byte
	var i int
	for i = 0; queriedIdByNameIterator.HasNext(); i++ {
		res, err := queriedIdByNameIterator.Next()
		if err != nil {
			return "", fmt.Errorf("An error occurred while querying the id by name: %s", err)
		}
		objectType, compositeKeyParts, err := stub.SplitCompositeKey(res.Key)
		if err != nil {
			return "", fmt.Errorf("An error occurred while truncating the composite key: %s", err)
		}
		returnedName := compositeKeyParts[0]
		returnedKey := compositeKeyParts[1]
		fmt.Printf("Found a key from index: %s name: %s key: %s\n", objectType, returnedName, returnedKey)

		userAsBytes, err := stub.GetState(returnedKey)
		if err != nil {
			return "", fmt.Errorf("User does not exist: %s", err)
		}

		result = userAsBytes
	}

	return string(result), nil
}

// 테스트 해야함
func getAllUsers(stub shim.ChaincodeStubInterface) (string, error) {
	queriedIdByUserIterator, err := stub.GetStateByPartialCompositeKey("user~id", []string{"User"})
	if err != nil {
		return "", fmt.Errorf("Failed to get state by partial composite key 'user~id': %s", err)
	}
	defer queriedIdByUserIterator.Close()

	var buffer string
	buffer = "["
	comma := false

	var i int
	for i = 0; queriedIdByUserIterator.HasNext(); i++ {
		res, err := queriedIdByUserIterator.Next()
		if err != nil {
			return "", fmt.Errorf("An error occurred while querying the id by name: %s", err)
		}

		objectType, compositeKeyParts, err := stub.SplitCompositeKey(res.Key)
		if err != nil {
			return "", fmt.Errorf("An error occurred while truncating the composite key: %s", err)
		}

		returnedObjectType := compositeKeyParts[0]
		returnedId := compositeKeyParts[1]
		fmt.Printf("Found a key from index: %s objectType: %s id: %s\n", objectType, returnedObjectType, returnedId)
		if comma == true {
			buffer += ", "
		}

		result, err := getUser(stub, []string{returnedId})
		if err != nil {
			return "", fmt.Errorf("User does not exist: %s", err)
		}
		buffer += result
		comma = true
	}
	buffer += "]"
	
	return string(buffer), nil
}
/* --------------------------------------- USER --------------------------------------- */


/* --------------------------------------- QUIZ --------------------------------------- */
func setVote(stub shim.ChaincodeStubInterface, args []string) (string, error) {
	if len(args) != 7 {
		return "", fmt.Errorf("Incorrect arguments. Please input 7 args.")
	}

	// 키 중복 검사
	result, _ := stub.GetState(args[0])
	if result != nil {
		return "", fmt.Errorf("Vote does not exist.")
	}

	// JSON  변환
	var vote = Vote {
		ObjectType: "Vote",
		Id:			args[0],
		Category:	args[1],
		Title: 		args[4] + " vs " + args[5],
		Begin: 		args[2],
		End: 		args[3],
		Choice1: 	args[4],
		Count1: 	"0",
		Users1:		"",
		Values1:	"",
		Choice2: 	args[5],
		Count2: 	"0",
		Users2:		"",
		Values2:	"",
		Result: 	"",	
		Status: 	"0",
		Reward:		args[6],
		Winner:		"",
	}
	// json 형식으로 변환
	voteAsBytes, _ := json.Marshal(vote)

	err := stub.PutState(args[0], voteAsBytes)
	if err != nil {
		return "", fmt.Errorf("Failed to set asset: %s", err)
	}

	voteIdIndexKey, err := stub.CreateCompositeKey("vote~id", []string{vote.ObjectType, vote.Id})
	if err != nil {
		return "", fmt.Errorf("Failed to get state by partial composite key 'vote~id': %s", err)
	}

	statusIdIndexKey, err := stub.CreateCompositeKey("status~id", []string{vote.Status, vote.Id})
	if err != nil {
		return "", fmt.Errorf("Failed to get state by partial composite key 'status~id': %s", err)
	}
	
	value := []byte{0x00}

	stub.PutState(voteIdIndexKey, value)
	stub.PutState(statusIdIndexKey, value)

	return string(voteAsBytes), nil
}

func getVote(stub shim.ChaincodeStubInterface, args[] string) (string, error) {
	if len(args) != 1 {
		return "", fmt.Errorf("Incorrect arguments. Expecting a key.")
	}
	id := args[0]
	voteAsBytes, err := stub.GetState(id)
	if err != nil {
		return "", fmt.Errorf("Vote does not exist: %s", err)
	}

	voteToTransfer := Vote{}
	err = json.Unmarshal(voteAsBytes, &voteToTransfer)
	if err != nil {
		return "", fmt.Errorf("An error occurred during unmarshal: %s", err)
	}
	
	// 완료되지 않은 투표인 경우
	if voteToTransfer.Status != "2" {
		voteToTransfer.Count1 = ""
		voteToTransfer.Count2 = ""
		voteToTransfer.Users1 = ""
		voteToTransfer.Users2 = ""
		voteToTransfer.Values1 = ""
		voteToTransfer.Values2 = ""
	}

	voteJSONasBytes, _ := json.Marshal(voteToTransfer)

	return string(voteJSONasBytes), nil
}

func getVoteByStatus(stub shim.ChaincodeStubInterface, args []string) (string, error) {
	if len(args) != 1 {
		return "", fmt.Errorf("Incorrect arguments. Please input 1 arg.")
	}
	status := args[0]
	queriedIdByStatusIterator, err := stub.GetStateByPartialCompositeKey("status~id", []string{status})
	if err != nil {
		return "", fmt.Errorf("Failed to get state by partial composite key 'status~id': %s", err)
	}
	defer queriedIdByStatusIterator.Close()

	var buffer string
	buffer = "["
	comma := false
	
	var i int
	for i = 0; queriedIdByStatusIterator.HasNext(); i++ {
		res, err := queriedIdByStatusIterator.Next()
		if err != nil {
			return "", fmt.Errorf("An error occurred while querying the id by status: %s", err)
		}

		objectType, compositeKeyParts, err := stub.SplitCompositeKey(res.Key)
		if err != nil {
			return "", fmt.Errorf("An error occurred while truncating the composite key: %s", err)
		}

		returnedName := compositeKeyParts[0]
		returnedKey := compositeKeyParts[1]
		fmt.Printf("- found a key from index:%s name:%s key:%s\n", objectType, returnedName, returnedKey)
		if comma == true {
			buffer += ", "
		}

		result, err := getVote(stub, []string{returnedKey})
		if err != nil {
			return "", fmt.Errorf("%s", err)
		}

		buffer += result
		comma = true
	}
	buffer += "]"

	return string(buffer), nil
}

// For test (Not used)
func getAllVotes(stub shim.ChaincodeStubInterface) (string, error) {
	queriedIdByVoteIterator, err := stub.GetStateByPartialCompositeKey("vote~id", []string{"Vote"})
	if err != nil {
		return "", fmt.Errorf("Failed to get state by partial composite key 'vote~id': %s", err)
	}
	defer queriedIdByVoteIterator.Close()

	var buffer string
	buffer = "["
	comma := false

	var i int
	for i = 0; queriedIdByVoteIterator.HasNext(); i++ {
		res, err := queriedIdByVoteIterator.Next()
		if err != nil {
			return "", fmt.Errorf("An error occurred while querying the id by vote: %s", err)
		}

		objectType, compositeKeyParts, err := stub.SplitCompositeKey(res.Key)
		if err != nil {
			return "", fmt.Errorf("An error occurred while truncating the composite key: %s", err)
		}

		returnedObjectType := compositeKeyParts[0]
		returnedId := compositeKeyParts[1]
		fmt.Printf("- found a key from index:%s name:%s key:%s\n", objectType, returnedObjectType, returnedId)
		if comma == true {
			buffer += ", "
		}

		result, err := getVote(stub, []string{returnedId})
		if err != nil {
			return "", fmt.Errorf("%s", err)
		}
		buffer += result
		comma = true
	}
	buffer += "]"

	return string(buffer), nil
}

func changeVoteStatus(stub shim.ChaincodeStubInterface, args []string) (string, error) {
	if len(args) != 1 {
		return "", fmt.Errorf("Incorrect arguments. Please input 1 args.")
	}
	id := args[0]

	voteAsBytes, err := stub.GetState(id)
	if err != nil {
		return "", fmt.Errorf("%s", err)
	} else if voteAsBytes == nil {
		return "In changeVoteStatus: There are no votes that match this criteria.", nil
	}

	voteToTransfer := Vote{}
	err = json.Unmarshal(voteAsBytes, &voteToTransfer)
	if err != nil {
		return "", fmt.Errorf("An error occurred during unmarshal: %s", err)
	}

	status, _ := strconv.Atoi(voteToTransfer.Status)

	indexName := "status~id"
	blank := "\u0000"
	oldStatusIdIndexKey := blank + indexName + blank + voteToTransfer.Status + blank + voteToTransfer.Id + blank
	err = stub.DelState(oldStatusIdIndexKey)
	if err != nil {
		return "", fmt.Errorf("%s", err)
	}

	status ++
	voteToTransfer.Status = strconv.Itoa(status)

	newStatusIdIndexKey, err := stub.CreateCompositeKey(indexName, []string{voteToTransfer.Status, voteToTransfer.Id})
	if err != nil {
		return "", fmt.Errorf("Incorrect arguments. Expecting a key and a value")
	}
	value := []byte{0x00}
	users := []string{}
	values := []string{}
	var user string
	var count int
	var selectedIdx int

	stub.PutState(newStatusIdIndexKey, value);
	if voteToTransfer.Status == "2" {
		count1, _ := strconv.Atoi(voteToTransfer.Count1)
		count2, _ := strconv.Atoi(voteToTransfer.Count2)
		if count1 > count2 {
			voteToTransfer.Result = voteToTransfer.Choice1
			users = strings.Split(voteToTransfer.Users1, ", ")
			values = strings.Split(voteToTransfer.Values1, ", ")
			count = count1
		} else if count1 < count2 {
			voteToTransfer.Result = voteToTransfer.Choice2
			users = strings.Split(voteToTransfer.Users2, ", ")
			values = strings.Split(voteToTransfer.Values2, ", ")
			count = count2
		} else {
			voteToTransfer.Result = "무승부"
			users1 := strings.Split(voteToTransfer.Users1, ", ")
			users2 := strings.Split(voteToTransfer.Users2, ", ")
			values1 := strings.Split(voteToTransfer.Values1, ", ")
			values2 := strings.Split(voteToTransfer.Values2, ", ")
			users = append(users1, users2...)
			values = append(values1, values2...)
			count = count1 + count2
		}

		seed := rand.NewSource(time.Now().UnixNano())
		rval := rand.New(seed)
		rnum := rval.Intn(count)
		
		for i, v := range users {
			weight, _ := strconv.Atoi(values[i])
			rnum -= weight
			if rnum <= 0 {
				selectedIdx = i
				user = v
			}
		}

		voteToTransfer.Winner = users[selectedIdx]
		fmt.Printf(user)
		fmt.Printf(voteToTransfer.Winner)

		userAsString, err := getUserByName(stub, []string{voteToTransfer.Winner})
		if userAsString == "" {
			return "", fmt.Errorf("User does not exist: %s", err)
		} 
		userAsBytes := []byte(userAsString)

		userToTransfer := User{}
		err = json.Unmarshal(userAsBytes, &userToTransfer)
		if err != nil {
			return "", fmt.Errorf("An error occurred during unmarshal: %s", err)
		}
	
		token, _ := strconv.Atoi(userToTransfer.Token)
		reward, _ := strconv.Atoi(voteToTransfer.Reward)
		token += reward
		userToTransfer.Token = strconv.Itoa(token)

		userJSONasBytes, _ := json.Marshal(userToTransfer)
		err = stub.PutState(userToTransfer.Id, userJSONasBytes)
		if err != nil {
			return "", fmt.Errorf("Failed to set asset: %s", err);
		}
	}
	voteJSONasBytes, _ := json.Marshal(voteToTransfer)
	err = stub.PutState(id, voteJSONasBytes)
	if err != nil {
		return "", fmt.Errorf("Failed to set asset: %s", err);
	}
	return string(voteToTransfer.Result), nil
}

func choice(stub shim.ChaincodeStubInterface, args[] string) (string, error) {
	if len(args) != 4 {
		return "", fmt.Errorf("Incorrect arguments. Please input 4 args.")
	}

	id		:= args[0]
	choice 	:= args[1]
	user	:= args[2]
	value	:= args[3] // 몇 개 투표할 지

	voteAsBytes, err := stub.GetState(id)
	if err != nil {
		return "", fmt.Errorf("Vote does not exist: %s", err)
	} else if voteAsBytes == nil {
		return "", fmt.Errorf("Vote does not exist.")
	}

	voteToTransfer := Vote{}
	err = json.Unmarshal(voteAsBytes, &voteToTransfer)
	if err != nil {
		return "", fmt.Errorf("An error occurred during unmarshal: %s", err)
	}

	if voteToTransfer.Status != "1" {
		return "", fmt.Errorf("This vote is not the time to choose.")
	}

	users1 := strings.Split(voteToTransfer.Users1, ", ")
	users2 := strings.Split(voteToTransfer.Users2, ", ")
	users := append(users1, users2...)
	if voteToTransfer.Category == "0" {
		if contains(users, user) != -1 {
			return "", fmt.Errorf("The user has already chosen.")
		}
	}
	
/* --------------------------------------------------------------- */
	userAsString, err := getUserByName(stub, []string{user})
	if err != nil {
		return "", fmt.Errorf("User does not exist: %s", err)
	} 

	userAsBytes := []byte(userAsString)

	userToTransfer := User{}
	err = json.Unmarshal(userAsBytes, &userToTransfer)
	if err != nil {
		return "", fmt.Errorf("An error occurred during unmarshal: %s", err)
	}

	if userToTransfer.Votes != "" {
		userToTransfer.Votes += ", "
	}

	if userToTransfer.Choices != "" {
		userToTransfer.Choices += ", "
	}

	if userToTransfer.Values != "" {
		userToTransfer.Values += ", "
	}
	
	nValue, _ := strconv.Atoi(value);
	if voteToTransfer.Category == "1" { // 유료 투표	
		nValue *= 100
		token, _ := strconv.Atoi(userToTransfer.Token)
		token -= nValue
		if token < 0 {
			return "", fmt.Errorf("Not enough token")
		}
		userToTransfer.Token = strconv.Itoa(token)
	}
	userToTransfer.Values += strconv.Itoa(nValue)
	userToTransfer.Votes += voteToTransfer.Title

/* --------------------------------------------------------------- */

	if choice == voteToTransfer.Choice1 {
		count, _ := strconv.Atoi(voteToTransfer.Count1)
		count += nValue
		voteToTransfer.Count1 = strconv.Itoa(count)
		userToTransfer.Choices += voteToTransfer.Choice1
		if voteToTransfer.Users1 != "" {
			voteToTransfer.Users1 += ", "
		}
		if voteToTransfer.Values1 != "" {
			voteToTransfer.Values1 += ", "
		}
		voteToTransfer.Users1 += user
		voteToTransfer.Values1 += value
	} else {
		count, _ := strconv.Atoi(voteToTransfer.Count2)
		count += nValue
		voteToTransfer.Count2 = strconv.Itoa(count)
		userToTransfer.Choices += voteToTransfer.Choice2
		if voteToTransfer.Users2 != "" {
			voteToTransfer.Users2 += ", "
		}
		if voteToTransfer.Values2 != "" {
			voteToTransfer.Values2 += ", "
		}
		voteToTransfer.Users2 += user
		voteToTransfer.Values2 += value
	}

	voteJSONasBytes, _ := json.Marshal(voteToTransfer)
	err = stub.PutState(id, voteJSONasBytes)
	if err != nil {
		return "", fmt.Errorf("Failed to set asset: %s", err);
	}

	userJSONasBytes, _ := json.Marshal(userToTransfer)
	err = stub.PutState(userToTransfer.Id, userJSONasBytes)
	if err != nil {
		return "", fmt.Errorf("Failed to set asset: %s", err);
	}

/* --------------------------------------------------------------- */

	return string("Choice succeed!"), nil
}

func getHistoryByVoteId(stub shim.ChaincodeStubInterface, args[] string) (string, error) {
	if len(args) != 1 {
		return "", fmt.Errorf("Incorrect number of arguments. Expecting 1 arg")
	}

	id := args[0]

	historyIterator, err := stub.GetHistoryForKey(id)
	if err != nil {
		return "", fmt.Errorf("%s", err)
	}
	defer historyIterator.Close()

	var buffer bytes.Buffer
	buffer.WriteString("[")

	comma := false
	for historyIterator.HasNext() {
		response, err := historyIterator.Next()
		if err != nil {
			return "", fmt.Errorf("An error occurred while querying the history: %s", err)
		}
		if comma == true {
			buffer.WriteString(", ")
		}
		buffer.WriteString("{\"TxId\":")
		buffer.WriteString("\"")
		buffer.WriteString(response.TxId)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Value\":")

		if response.IsDelete {
			buffer.WriteString("null")
		} else {
			buffer.WriteString(string(response.Value))
		}

		buffer.WriteString(", \"Timestamp\":")
		buffer.WriteString("\"")
		buffer.WriteString(time.Unix(response.Timestamp.Seconds, int64(response.Timestamp.Nanos)).String())
		buffer.WriteString("\"")

		buffer.WriteString(", \"IsDelete\":")
		buffer.WriteString("\"")
		buffer.WriteString(strconv.FormatBool(response.IsDelete))
		buffer.WriteString("\"")

		buffer.WriteString("}")
		comma = true
	}
	buffer.WriteString("]")

	return buffer.String(), nil
}


/* --------------------------------------- QUIZ --------------------------------------- */

func contains(slice []string, item string) int {
	for i, v := range slice {
		if v == item {
			return i
		}
	}
	return -1
}

func main() {
	if err := shim.Start(new(SimpleAsset)); err != nil {
		fmt.Printf("Error starting SimpleAsset chaincode: %s", err)
	}
}