const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract("StarNotary", accs => {
  accounts = accs;
  owner = accounts[0];
});

it("can Create a Star", async () => {
  let tokenId = 1;
  let instance = await StarNotary.deployed();
  await instance.createStar("Awesome Star!", tokenId, { from: accounts[0] });
  assert.equal(await instance.tokenIdToStarInfo.call(tokenId), "Awesome Star!");
});

it("lets user1 put up their star for sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let starId = 2;
  let starPrice = web3.utils.toWei(".01", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it("lets user1 get the funds after the sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 3;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
  await instance.buyStar(starId, { from: user2, value: balance });
  let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
  let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
  let value2 = Number(balanceOfUser1AfterTransaction);
  assert.equal(value1, value2);
});

it("lets user2 buy a star, if it is put up for sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 4;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
  await instance.buyStar(starId, { from: user2, value: balance });
  assert.equal(await instance.ownerOf.call(starId), user2);
});

it("lets user2 buy a star and decreases its balance in ether", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 5;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
  const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
  await instance.buyStar(starId, { from: user2, value: balance, gasPrice: 0 });
  const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
  let value =
    Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
  assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it("can add the star name and star symbol properly", async () => {
  // 1. create a Star with different tokenId
  // 2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
  let instance = await StarNotary.deployed();
  let name = "Eu Start";
  let tokenId = 42;
  await instance.createStar(name, tokenId, { from: accounts[0] });
  assert.equal(await instance.name.call(), "JHG Coin");
  assert.equal(await instance.symbol.call(), "JHG");
});

it("lets 2 users exchange stars", async () => {
  // 1. create 2 Stars with different tokenId
  // 2. Call the exchangeStars functions implemented in the Smart Contract
  // 3. Verify that the owners changed
  let instance = await StarNotary.deployed();

  let nameStar1 = "Big Star";
  let tokenId1 = "10";
  let address1 = accounts[0];
  await instance.createStar(nameStar1, tokenId1, { from: address1 });
  assert.equal(await instance.ownerOf(tokenId1), address1);

  let nameStar2 = "Little Star";
  let tokenId2 = "33";
  let address2 = accounts[1];
  await instance.createStar(nameStar2, tokenId2, { from: address2 });
  assert.equal(await instance.ownerOf(tokenId2), address2);

  await instance.exchangeStars(tokenId1, tokenId2);
  assert.equal(await instance.ownerOf(tokenId2), address1);
  assert.equal(await instance.ownerOf(tokenId1), address2);
});

it("lets a user transfer a star", async () => {
  // 1. create a Star with different tokenId
  // 2. use the transferStar function implemented in the Smart Contract
  // 3. Verify the star owner changed.
  let instance = await StarNotary.deployed();

  let name = "Dark Star";
  let tokenId = "72";
  let address1 = accounts[0];
  await instance.createStar(name, tokenId, { from: address1 });
  assert.equal(await instance.ownerOf(tokenId), address1);

  let address2 = accounts[1];
  await instance.transferStar(address2, tokenId, { from: address1 });
  assert.equal(await instance.ownerOf(tokenId), address2);
});

it("lookUptokenIdToStarInfo test", async () => {
  // 1. create a Star with different tokenId
  // 2. Call your method lookUptokenIdToStarInfo
  // 3. Verify if you Star name is the same
  let instance = await StarNotary.deployed();

  let name = "Unreal Star";
  let tokenId = "1001";
  let address = accounts[0];
  await instance.createStar(name, tokenId, { from: address });

  assert.equal(await instance.lookUptokenIdToStarInfo(tokenId), name);
});
