import { ethers, waffle} from 'hardhat';
import { BaseERC20Token } from "../typechain/BaseERC20Token";
import { Signer } from "ethers";
import chai from 'chai';
import { solidity } from 'ethereum-waffle';
import { FundsManager } from "../typechain/FundsManager";
import { GrantRoundFactory } from "../typechain/GrantRoundFactory";
import deployGrantRound from "./helpers/DeployGrantRound";
import getPoseidonLibraries from "./helpers/GetPoseidonLibraries"
import { PubKey, PrivKey, Keypair } from "maci-domainobjs";


chai.use(solidity);
const { expect } = chai;

describe('Funds manager', () => {
  
  let deployer: Signer;
  let addr1: Signer;
  let addr2: Signer;
  let fundsManager: FundsManager;
  let token: BaseERC20Token;

  beforeEach(async () => {
    [deployer, addr1, addr2] = await ethers.getSigners();
    const FundsManagerFactory = await ethers.getContractFactory("FundsManager", deployer)

    fundsManager = await FundsManagerFactory.deploy();

    const BaseERC20TokenFactory = await ethers.getContractFactory("BaseERC20Token", deployer)
    token = await BaseERC20TokenFactory.deploy(100);
    await expect((await token.deployTransaction.wait()).status).to.not.equal(0);
  })

  it('verify - initializes properly', async () => {
    expect((await fundsManager.deployTransaction.wait()).status).to.not.equal(0);
    fundsManager.address

  })

  it('verify - configured properly', async () => {
    expect(await ethers.provider.getCode(fundsManager.address)).to.not.equal("0x")
    const contract = await ethers.getContractAt("FundsManager", fundsManager.address)
  })

  describe('managing funding sources', () => {
    it('verify - allows owner to add funding source', async () => {
      const tx = await fundsManager.addFundingSource(await addr1.getAddress())
      expect((await tx.wait()).status).to.not.equal(0)
    })

    it('require fail - allows only owner to add funding source', async () => {
      expect(
        fundsManager.connect(addr1).addFundingSource(await addr2.getAddress())
      ).to.be.revertedWith("Ownable: caller is not the owner");
    })

    it('require fail - reverts if funding source is already added', async () => {
      fundsManager.addFundingSource(await addr1.getAddress())
      expect(fundsManager.addFundingSource(await addr1.getAddress())).
      to.be.revertedWith("Factory: Funding source already added")
    })

    // Test calling methods with bad inputs as well
    it('verify - allows owner to remove funding source', async () => {
      fundsManager.addFundingSource(await addr1.getAddress())
      fundsManager.removeFundingSource(await addr1.getAddress())
      expect(true)
    })

    it('require fail - allows only owner to remove funding source', async () => {
      fundsManager.addFundingSource(await addr2.getAddress())
      expect(fundsManager.connect(addr1).removeFundingSource(await addr2.getAddress())).
      to.be.revertedWith("Ownable: caller is not the owner")
    })

    it('require fail - reverts if funding source is already removed', async () => {
      fundsManager.addFundingSource(await addr1.getAddress())
      fundsManager.removeFundingSource(await addr1.getAddress())
      expect(fundsManager.removeFundingSource(await addr1.getAddress())).
      to.be.revertedWith("Factory: Funding source not found")
    })
  })

  it('allows direct contributions to the matching pool', async () => {
    //NOTE I'm assuming matching pool means contract's balance
    const fundingSource = await ethers.Wallet.createRandom()
    await fundsManager.addFundingSource(fundingSource.address)
    await token.transfer(fundingSource.address, 10);
    await token.transfer(fundsManager.address, 10);

    const fundingSourceSigner = await ethers.getSigner(fundingSource.address)
    await token.connect(fundingSourceSigner).approve(fundsManager.address, 10)
    //console.log(await token.allowance(fundingSource.address, fundsManager.address))
    //
//    await token.approve(fundsManager.address, 100)
//
//    console.log(await token.allowance(await deployer.getAddress(), fundsManager.address))
//
//    console.log(await token.allowance(fundsManager.address, fundingSource.address))
//    console.log(await token.allowance(fundingSource.address, fundsManager.address))
//    //console.log(fundsManager.address)
//    //console.log(s)
//    //console.log(deployer)
//
//    console.log("ASDSAD")
//    expect(await fundsManager.getMatchingFunds(token.address)).to.equal(10)
  })

  //describe('withdrawing funds', () => {
  //  //Seems like QFI contract handles withdrawls
  //
  //  it('allows contributors to withdraw funds', async () => {
  //   
  //  })

  //  it('disallows withdrawal if round is not cancelled', async () => {
  //    
  //  })

  //  it('reverts if user did not contribute to the round', async () => {
  //   
  //  })

  //  it('reverts if funds are already withdrawn', async () => {
  //    
  //  })
  //})



  describe('transferring matching funds', () => {
    beforeEach(async () => {
      const coordinator = ethers.Wallet.createRandom()
      const grantRoundFactory = await deployGrantRound(deployer)
      const BaseERC20TokenFactory = await ethers.getContractFactory("BaseERC20Token", deployer)
      token = await BaseERC20TokenFactory.deploy(50); 

      const linkedLibraryAddresses = await getPoseidonLibraries(deployer);

      const RecipientRegistryFactory = await ethers.getContractFactory("OptimisticRecipientRegistry", deployer);
      const PollFactoryFactory = await ethers.getContractFactory("PollFactory", {signer: deployer, libraries: {...linkedLibraryAddresses}})

      const FreeForAllGateKeeperFactory = await ethers.getContractFactory("FreeForAllGatekeeper", deployer);
      const ConstantInitialVoiceCreditProxyFactory = await ethers.getContractFactory("ConstantInitialVoiceCreditProxy", deployer);

      const MACIFactory = await ethers.getContractFactory("MACI", {signer: deployer, libraries: {...linkedLibraryAddresses}})


      const optimisticRecipientRegistry = await RecipientRegistryFactory.deploy(0, 0, await deployer.getAddress());
      const pollFactory = await PollFactoryFactory.deploy();
      const freeForAllGateKeeper = await FreeForAllGateKeeperFactory.deploy();
      const constantInitialVoiceCreditProxy = await ConstantInitialVoiceCreditProxyFactory.deploy(0);

      const VKRegistryFactory = await ethers.getContractFactory("VkRegistry", deployer)
      const VKRegistry = await VKRegistryFactory.deploy()

      const maci = await MACIFactory.deploy(
        pollFactory.address,
        freeForAllGateKeeper.address,
        constantInitialVoiceCreditProxy.address
      );
      const MessageAqFactoryFactory = await ethers.getContractFactory( "MessageAqFactory", {
        signer: deployer,
        libraries: { ...linkedLibraryAddresses }
      }
      )

      const messageAqFactory = await MessageAqFactoryFactory.deploy();
      messageAqFactory.transferOwnership(grantRoundFactory.address)
      grantRoundFactory.setMessageAqFactory(messageAqFactory.address)

      const coordinatorKey = new Keypair()
      const grantRound = grantRoundFactory.deployGrantRound(
        1,
        coordinator.address,
        token.address,
        100,
        {maxMessages: 5, maxVoteOptions: 5},
        {intStateTreeDepth: 1, messageTreeSubDepth: 1, messageTreeDepth: 1, voteOptionTreeDepth: 1},
        {messageBatchSize: 1, tallyBatchSize: 1},
        coordinatorKey.pubKey.asContractParam(),
        VKRegistry.address,
        maci.address,
        grantRoundFactory.address
      );
    })
    
    it('returns the amount of available matching funding', async () => {
    //create wallets with some balance and add as funding sources
      //const fundingSource = ethers.Wallet.createRandom()
      //await fundsManager.addFundingSource(fundingSource.address)
      //expect(await fundsManager.getMatchingFunds(token.address)).to.equal(0)
    })

    it('pulls funds from funding source', async () => {
      
    })

    it('pulls funds from funding source if allowance is greater than balance', async () => {
      
    })

    
  })



})
