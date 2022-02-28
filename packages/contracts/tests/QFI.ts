import { ethers } from "hardhat";
import { BigNumber, Signer } from "ethers";
import chai from 'chai';
import { solidity } from 'ethereum-waffle';
import { OptimisticRecipientRegistry__factory } from "../typechain/factories/OptimisticRecipientRegistry__factory";
import { BaseERC20Token__factory } from "../typechain/factories/BaseERC20Token__factory";
import { BaseERC20Token } from "../typechain/BaseERC20Token";
import { QFI } from "../typechain/QFI";
import { QFI__factory, QFILibraryAddresses } from "../typechain/factories/QFI__factory";
import { PoseidonT3 } from "../typechain/PoseidonT3";
import { PoseidonT3__factory } from "../typechain/factories/PoseidonT3__factory";
import { PoseidonT4 } from "../typechain/PoseidonT4";
import { PoseidonT4__factory } from "../typechain/factories/PoseidonT4__factory";
import { PoseidonT5 } from "../typechain/PoseidonT5";
import { PoseidonT5__factory } from "../typechain/factories/PoseidonT5__factory";
import { PoseidonT6 } from "../typechain/PoseidonT6";
import { PoseidonT6__factory } from "../typechain/factories/PoseidonT6__factory";
import { GrantRoundFactory } from "../typechain/GrantRoundFactory";
import { PollFactory__factory, PollFactoryLibraryAddresses } from "../typechain/factories/PollFactory__factory";
import { FreeForAllGatekeeper__factory } from "../typechain/factories/FreeForAllGatekeeper__factory";
import { ConstantInitialVoiceCreditProxy__factory } from "../typechain/factories/ConstantInitialVoiceCreditProxy__factory";
import { PubKey, PrivKey, Keypair } from "maci-domainobjs";

chai.use(solidity);
const { expect } = chai;


describe('QFI', () => {
  
  let deployer: Signer;
  let RecipientRegistryFactory: OptimisticRecipientRegistry__factory;
  let BaseERC20TokenFactory: BaseERC20Token__factory;
  let baseERC20Token: BaseERC20Token;
  let qfi: QFI;
  let MessageAqFactoryFactory: any
  let pollFactory: any
  let grantRoundFactory: any
  let optimisticRecipientRegistry: any
  let PollFactoryFactory: any
  let FreeForAllGateKeeperFactory: any
  let freeForAllGateKeeper: any
  let ConstantInitialVoiceCreditProxyFactory: any
  let constantInitialVoiceCreditProxy: any
  let QFIFactory: any
  let VKRegistryFactory: any
  let VKRegistry: any
  let messageAqFactory : any
  let messageAqFactoryGrants: any
  let GrantRoundFactory: any


  beforeEach(async () => {
    [deployer] = await ethers.getSigners();
    const PoseidonT3Factory = new PoseidonT3__factory(deployer);
    const PoseidonT4Factory = new PoseidonT4__factory(deployer);
    const PoseidonT5Factory = new PoseidonT5__factory(deployer);
    const PoseidonT6Factory = new PoseidonT6__factory(deployer);
    const poseidonT3 = await PoseidonT3Factory.deploy();
    const poseidonT4 = await PoseidonT4Factory.deploy();
    const poseidonT5 = await PoseidonT5Factory.deploy();
    const poseidonT6 = await PoseidonT6Factory.deploy();

    const linkedLibraryAddresses = {
      ["maci-contracts/contracts/crypto/Hasher.sol:PoseidonT5"]: poseidonT5.address,
      ["maci-contracts/contracts/crypto/Hasher.sol:PoseidonT3"]: poseidonT3.address,
      ["maci-contracts/contracts/crypto/Hasher.sol:PoseidonT6"]: poseidonT6.address,
      ["maci-contracts/contracts/crypto/Hasher.sol:PoseidonT4"]: poseidonT4.address,
    };

    GrantRoundFactory = await ethers.getContractFactory( "GrantRoundFactory", {
      signer: deployer,
      libraries: { ...linkedLibraryAddresses }
    }
    )
     MessageAqFactoryFactory = await ethers.getContractFactory( "MessageAqFactory", {
      signer: deployer,
      libraries: { ...linkedLibraryAddresses }
    }
    )


    BaseERC20TokenFactory = new BaseERC20Token__factory(deployer);
    baseERC20Token = await BaseERC20TokenFactory.deploy(100);
    RecipientRegistryFactory = new OptimisticRecipientRegistry__factory(deployer);
    optimisticRecipientRegistry = await RecipientRegistryFactory.deploy(0, 0, await deployer.getAddress());
    grantRoundFactory = await GrantRoundFactory.deploy();
    grantRoundFactory.setRecipientRegistry(optimisticRecipientRegistry.address);


    PollFactoryFactory = new PollFactory__factory({ ...linkedLibraryAddresses }, deployer);
    pollFactory = await PollFactoryFactory.deploy();

     FreeForAllGateKeeperFactory = new FreeForAllGatekeeper__factory(deployer);
     freeForAllGateKeeper = await FreeForAllGateKeeperFactory.deploy();
     ConstantInitialVoiceCreditProxyFactory = new ConstantInitialVoiceCreditProxy__factory(deployer);
     constantInitialVoiceCreditProxy = await ConstantInitialVoiceCreditProxyFactory.deploy(0);

    QFIFactory = new QFI__factory({ ...linkedLibraryAddresses }, deployer);


    qfi = await QFIFactory.deploy(
      baseERC20Token.address,
      grantRoundFactory.address,
      pollFactory.address,
      freeForAllGateKeeper.address,
      constantInitialVoiceCreditProxy.address
    )
    VKRegistryFactory = await ethers.getContractFactory("VkRegistry", deployer)
    VKRegistry = await VKRegistryFactory.deploy()

    messageAqFactory = await MessageAqFactoryFactory.deploy();
    messageAqFactoryGrants = await MessageAqFactoryFactory.deploy();

    await messageAqFactory.transferOwnership(pollFactory.address)
    await messageAqFactoryGrants.transferOwnership(grantRoundFactory.address)
    await pollFactory.transferOwnership(qfi.address)
    await grantRoundFactory.transferOwnership(qfi.address)
    await qfi.initialize(VKRegistry.address, messageAqFactory.address, messageAqFactoryGrants.address)
  })

  it('initializes', async () => {
    const deployTransaction = await qfi.deployTransaction.wait()
    expect(deployTransaction.status).to.not.equal(0);
    expect(deployTransaction.contractAddress).to.equal(qfi.address);
    expect(await qfi.owner()).to.equal(await deployer.getAddress());
  })

  it('configured', async () => {
    expect(await qfi.grantRoundFactory()).to.not.equal(ethers.constants.AddressZero)
    expect(await qfi.currentStage()).to.equal(1);
    expect(await qfi.nativeToken()).to.not.equal(ethers.constants.AddressZero)
    expect(await qfi.voiceCreditFactor()).to.equal(10000000000000)
  })

  //describe('changing signup gatekeeper', () => {
  //  TODO confirm if this test is needed
  //  it('allows owner to set signup gatekeeper', async () => {
  //    // signup gate keeper is only set during deploy?
  //    // so won't owner always be setting?
  //    // not sure how to test

  //  })

  //  it('allows only owner to set signup gatekeeper', async () => {
  //  })

  //  it('allows owner to change signup gatekeeper', async () => {
  //  })
  //})

  describe('deploying funding round', () => {

    it('deploys funding round', async () => {
      const coordinator = ethers.Wallet.createRandom()
      const coordinatorKey = new Keypair()
      const tx = await qfi.deployGrantRound(
        10,
        {maxMessages: 5, maxVoteOptions: 5},
        {intStateTreeDepth: 1, messageTreeSubDepth:1, messageTreeDepth: 1, voteOptionTreeDepth:1 },
        coordinatorKey.pubKey.asContractParam(),
        coordinator.address,
      )
    })

    it('require fail - reverts if signup gatekeeper is not set', async () => {
      // set gatekeeper to address that points to nothing
      // make sure transaction reverts
      //
      // TODO it doesn't seem like there is logic
      // that will make this revert right now in 
      // deployGrantRound methods
      pollFactory = await PollFactoryFactory.deploy();
      optimisticRecipientRegistry = await RecipientRegistryFactory.deploy(0, 0, await deployer.getAddress());
      grantRoundFactory = await GrantRoundFactory.deploy();
      grantRoundFactory.setRecipientRegistry(optimisticRecipientRegistry.address);


      const missingGatekeepterQfi = await QFIFactory.deploy(
        baseERC20Token.address,
        grantRoundFactory.address,
        pollFactory.address,
        ethers.constants.AddressZero,
        constantInitialVoiceCreditProxy.address
      )
      console.log(missingGatekeepterQfi)

      messageAqFactory = await MessageAqFactoryFactory.deploy();
      messageAqFactoryGrants = await MessageAqFactoryFactory.deploy();

      await messageAqFactory.transferOwnership(pollFactory.address)
      await messageAqFactoryGrants.transferOwnership(grantRoundFactory.address)
      await pollFactory.transferOwnership(missingGatekeepterQfi.address)
      await grantRoundFactory.transferOwnership(missingGatekeepterQfi.address)
      await missingGatekeepterQfi.initialize(VKRegistry.address, messageAqFactory.address, messageAqFactoryGrants.address)

      const coordinator = ethers.Wallet.createRandom()
      const coordinatorKey = new Keypair()
      await missingGatekeepterQfi.deployGrantRound(
        10,
        {maxMessages: 5, maxVoteOptions: 5},
        {intStateTreeDepth: 1, messageTreeSubDepth:1, messageTreeDepth: 1, voteOptionTreeDepth:1 },
        coordinatorKey.pubKey.asContractParam(),
        coordinator.address,
      )
    })

    it('require fail - reverts if recipient registry is not set', async () => {
      
    })

    it('require fail - reverts if native token is not set', async () => {
      
    })

    it('require fail - reverts if coordinator is not set', async () => {
      //Not sure how to do this because requires pub key struct
      
    })

    it('require fail - reverts if current round is not finalized', async () => {
      //set current stage to waiting for finalization then try to deploy
      
    })

    it('require fail - verify - deploys new funding round after previous round has been finalized', async () => {
     
    })

    it('require fail - only owner can deploy funding round', async () => {
    })
  })

  describe('transferring matching funds', () => {

    it('returns the amount of available matching funding', async () => {
     
    })

    it('allows owner to finalize round', async () => {
      
    })

    it('does not allow funds to be sent without a tally', async () => {
      
    })

    it('pulls funds from funding source', async () => {
      
    })

    it('pulls funds from funding source if allowance is greater than balance', async () => {
      
    })

    it('allows only owner to finalize round', async () => {
      
    })

    it('reverts if round has not been deployed', async () => {
      
    })
  })

  // describe('cancelling round', () => {

  //   it('allows owner to cancel round', async () => {
      
  //   })

  //   it('allows only owner to cancel round', async () => {
     
  //   })

  //   it('reverts if round has not been deployed', async () => {
     
  //   })

  //   it('reverts if round is finalized', async () => {
      
  //   })
  // })

  // it('allows owner to set native token', async () => {
    
  // })

  // it('only owner can set native token', async () => {
    
  // })

})
