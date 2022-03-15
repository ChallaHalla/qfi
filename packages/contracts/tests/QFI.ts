import { ethers } from "hardhat";
import { BigNumber, Signer } from "ethers";
import chai from 'chai';
import { solidity } from 'ethereum-waffle';
import getPoseidonLibraries from "./helpers/GetPoseidonLibraries"
import { OptimisticRecipientRegistry__factory } from "../typechain/factories/OptimisticRecipientRegistry__factory";
import { BaseERC20Token__factory } from "../typechain/factories/BaseERC20Token__factory";
import { BaseERC20Token } from "../typechain/BaseERC20Token";
import { QFI } from "../typechain/QFI";
import { QFI__factory, QFILibraryAddresses } from "../typechain/factories/QFI__factory";
import { GrantRoundFactory } from "../typechain/GrantRoundFactory";
import { GrantRoundInterface } from "../typechain/GrantRound";
import { PollFactory } from "../typechain/PollFactory";
import { PollFactory__factory, PollFactoryLibraryAddresses } from "../typechain/factories/PollFactory__factory";
import { FreeForAllGatekeeper__factory } from "../typechain/factories/FreeForAllGatekeeper__factory";
import { ConstantInitialVoiceCreditProxy__factory } from "../typechain/factories/ConstantInitialVoiceCreditProxy__factory";
import { PollProcessorAndTallyer } from "../typechain/PollProcessorAndTallyer";
import { PollProcessorAndTallyer__factory } from "../typechain/factories/PollProcessorAndTallyer__factory";

import {MockVerifier} from '../typechain/MockVerifier'
import {MockVerifier__factory} from '../typechain/factories/MockVerifier__factory'
import { PubKey, PrivKey, Keypair } from "maci-domainobjs";

chai.use(solidity);
const { expect } = chai;


describe('QFI', () => {
  
  let deployer: Signer;
  let addr1: Signer;
  let RecipientRegistryFactory: OptimisticRecipientRegistry__factory;
  let BaseERC20TokenFactory: BaseERC20Token__factory;
  let baseERC20Token: BaseERC20Token;
  let qfi: QFI;
  let MessageAqFactoryFactory: any
  let pollFactory: PollFactory
  let grantRoundFactory: any
  let optimisticRecipientRegistry: any
  let PollFactoryFactory: PollFactory__factory
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
    [deployer, addr1] = await ethers.getSigners();
    const linkedLibraryAddresses = await getPoseidonLibraries(deployer)

    GrantRoundFactory = await ethers.getContractFactory( "GrantRoundFactory", {
      signer: deployer,
      libraries: { ...linkedLibraryAddresses }
    })

     MessageAqFactoryFactory = await ethers.getContractFactory( "MessageAqFactory", {
      signer: deployer,
      libraries: { ...linkedLibraryAddresses }
    })


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
    let pollFactory: any;
    let optimisticRecipientRegistry: any;
    let grantRoundFactory: any;
    let messageAqFactory: any;
    let messageAqFactoryGrants: any;
    let FreeForAllGateKeeperFactory: any;
    let freeForAllGateKeeper: any;

    beforeEach(async () => {
      pollFactory = await PollFactoryFactory.deploy();
      optimisticRecipientRegistry = await RecipientRegistryFactory.deploy(0, 0, await deployer.getAddress());
      grantRoundFactory = await GrantRoundFactory.deploy();
      await grantRoundFactory.setRecipientRegistry(optimisticRecipientRegistry.address);

      messageAqFactory = await MessageAqFactoryFactory.deploy();
      messageAqFactoryGrants = await MessageAqFactoryFactory.deploy();
      FreeForAllGateKeeperFactory = new FreeForAllGatekeeper__factory(deployer);
      freeForAllGateKeeper = await FreeForAllGateKeeperFactory.deploy();
    })

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

    //it('require fail - reverts if signup gatekeeper is not set', async () => {
    //  // set gatekeeper to address that points to nothing
    //  // make sure transaction reverts
    //  //
    //  // TODO it doesn't seem like there is logic
    //  // that will make this revert right now in 
    //  // deployGrantRound methods

    //  const missingGatekeepterQfi = await QFIFactory.deploy(
    //    baseERC20Token.address,
    //    grantRoundFactory.address,
    //    pollFactory.address,
    //    ethers.constants.AddressZero,
    //    constantInitialVoiceCreditProxy.address
    //  )

    //  await messageAqFactory.transferOwnership(pollFactory.address)
    //  await messageAqFactoryGrants.transferOwnership(grantRoundFactory.address)
    //  await pollFactory.transferOwnership(missingGatekeepterQfi.address)
    //  await grantRoundFactory.transferOwnership(missingGatekeepterQfi.address)
    //  await missingGatekeepterQfi.initialize(VKRegistry.address, messageAqFactory.address, messageAqFactoryGrants.address)

    //  const coordinator = ethers.Wallet.createRandom()
    //  const coordinatorKey = new Keypair()
    //  await missingGatekeepterQfi.deployGrantRound(
    //    10,
    //    {maxMessages: 5, maxVoteOptions: 5},
    //    {intStateTreeDepth: 1, messageTreeSubDepth:1, messageTreeDepth: 1, voteOptionTreeDepth:1 },
    //    coordinatorKey.pubKey.asContractParam(),
    //    coordinator.address,
    //  )
    //})

    it('require fail - reverts if recipient registry is not set', async () => {
      const missingRecipientRegistryQFI = await QFIFactory.deploy(
        baseERC20Token.address,
        grantRoundFactory.address,
        pollFactory.address,
        freeForAllGateKeeper.address,
        constantInitialVoiceCreditProxy.address
      )
      await messageAqFactory.transferOwnership(pollFactory.address)
      await messageAqFactoryGrants.transferOwnership(grantRoundFactory.address)
      await pollFactory.transferOwnership(missingRecipientRegistryQFI.address)
      await grantRoundFactory.transferOwnership(missingRecipientRegistryQFI.address)

      try {
        await missingRecipientRegistryQFI.initialize(ethers.constants.AddressZero, messageAqFactory.address, messageAqFactoryGrants.address)
      } catch (error) {
        expect(error.message).to.equal("Transaction reverted: function call to a non-contract account")
      }
    })

    it('require fail - reverts if native token is not set', async () => {
      try {
        await QFIFactory.deploy(
            ethers.constants.AddressZero,
            grantRoundFactory.address,
            pollFactory.address,
            freeForAllGateKeeper.address,
            constantInitialVoiceCreditProxy.address
          );
        throw null;
      }
      catch (error) {
        expect(error.message).to.equal("Transaction reverted: function call to a non-contract account")
      }
    })

    it('require fail - reverts if coordinator is not set', async () => {
      //TODO this test is not failing when coordinate is zero address
      //how to ensure coordinator is not set? null or undefined aren't valid
      //inputs
  
      const coordinatorKey = new Keypair()
      const tx = await qfi.deployGrantRound(
        10,
        {maxMessages: 5, maxVoteOptions: 5},
        {intStateTreeDepth: 1, messageTreeSubDepth:1, messageTreeDepth: 1, voteOptionTreeDepth:1 },
        coordinatorKey.pubKey.asContractParam(),
        ethers.constants.AddressZero,
      )
      
    })

    it('require fail - reverts if current round is not finalized', async () => {
      //set current stage to waiting for finalization then try to deploy
      const coordinator = ethers.Wallet.createRandom()
      const coordinatorKey = new Keypair()

      await qfi.deployGrantRound(
        10,
        {maxMessages: 5, maxVoteOptions: 5},
        {intStateTreeDepth: 1, messageTreeSubDepth:1, messageTreeDepth: 1, voteOptionTreeDepth:1 },
        coordinatorKey.pubKey.asContractParam(),
        coordinator.address,
      )

       expect(
         qfi.deployGrantRound(
           10,
           {maxMessages: 5, maxVoteOptions: 5},
           {intStateTreeDepth: 1, messageTreeSubDepth:1, messageTreeDepth: 1, voteOptionTreeDepth:1 },
           coordinatorKey.pubKey.asContractParam(),
           coordinator.address,
         )
        ).to.be.revertedWith("MACI: Cannot deploy a new grant round while not in the WAITING_FOR_SIGNUPS_AND_TOPUPS stage")
        
    })

    //it('require fail - verify - deploys new funding round after previous round has been finalized', async () => {
    //  //TODO sturggling to set stage to finalized
    //  const coordinator = ethers.Wallet.createRandom()
    //  const coordinatorKey = new Keypair()
    //  const MockVerifierFactory = new MockVerifier__factory(deployer);
    //  const mockVerifier = await MockVerifierFactory.deploy();

    //  const PollProcessorAndTallyerFactory = new PollProcessorAndTallyer__factory(deployer);
    //  const pollProcessorAndTallyer = await PollProcessorAndTallyerFactory.deploy(mockVerifier.address);

    //  await qfi.deployGrantRound(
    //    1,
    //    {maxMessages: 5, maxVoteOptions: 5},
    //    {intStateTreeDepth: 1, messageTreeSubDepth:1, messageTreeDepth: 1, voteOptionTreeDepth:1 },
    //    coordinatorKey.pubKey.asContractParam(),
    //    coordinator.address,
    //  )

    //  //await qfi.contribute(qfi.publicKey, 100)

    //  await qfi.setPollProcessorAndTallyer(pollProcessorAndTallyer.address)
    //  //const grantRoundAddress = await qfi.getGrantRound(0)
    //  //const grantRound = await ethers.getContractAt("GrantRound", grantRoundAddress, deployer)

    //  //await grantRound.mergeMaciStateAq(0)
    //  //await pollProcessorAndTallyer.processMessages(grantRound.address, 1, [1,1,1,1,1,1,1,1])

    //  //const t = await pollProcessorAndTallyer.processingComplete()

    //  await qfi.closeVotingAndWaitForDeadline()
    //  //await qfi.finalizeCurrentRound(100, 100)
    //  //expect(
    //  //qfi.deployGrantRound(
    //  //  10,
    //  //  {maxMessages: 5, maxVoteOptions: 5},
    //  //  {intStateTreeDepth: 1, messageTreeSubDepth:1, messageTreeDepth: 1, voteOptionTreeDepth:1 },
    //  //  coordinatorKey.pubKey.asContractParam(),
    //  //  coordinator.address,
    //  //)).to.be.revertedWith("MACI: Cannot deploy a new grant round while not in the WAITING_FOR_SIGNUPS_AND_TOPUPS stage")
    //})

    it('require fail - only owner can deploy funding round', async () => {
      const coordinator = ethers.Wallet.createRandom()
      const coordinatorKey = new Keypair()
        expect(
          qfi.connect(addr1).deployGrantRound(
            10,
            {maxMessages: 5, maxVoteOptions: 5},
            {intStateTreeDepth: 1, messageTreeSubDepth:1, messageTreeDepth: 1, voteOptionTreeDepth:1 },
            coordinatorKey.pubKey.asContractParam(),
            coordinator.address,
          )
        ).to.be.revertedWith("Ownable: caller is not the owner");
    })
  })

  describe('transferring matching funds', () => {
    //TODO this seems like it's meant for funds manager?
    it('allows only owner to finalize round', async () => {
      expect(qfi.connect(addr1).finalizeCurrentRound(100, 100)).to.be.revertedWith("Ownable: caller is not the owner");
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
