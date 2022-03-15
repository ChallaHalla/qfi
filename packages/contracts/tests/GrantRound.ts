import { ethers } from 'hardhat';
import { Wallet, Signer } from "ethers";
import chai from 'chai';
import { GrantRoundFactory } from "../typechain/GrantRoundFactory";
import { GrantRound } from "../typechain/GrantRound";
import { solidity } from 'ethereum-waffle';
import { BaseERC20Token } from "../typechain/BaseERC20Token";
import { PubKey, PrivKey, Keypair } from "maci-domainobjs";

chai.use(solidity);
const { expect } = chai;

describe('Funding Round Factory', () => {
  
  let deployer: Signer;
  let coordinator: Wallet;
  let grantRound: GrantRound;
  let token: BaseERC20Token;
  let VKRegistry: any;


  beforeEach(async () => {
    [deployer] = await ethers.getSigners();
    const PoseidonT3Factory =await  ethers.getContractFactory("PoseidonT3", deployer)
    const PoseidonT4Factory = await ethers.getContractFactory("PoseidonT4", deployer)
    const PoseidonT5Factory = await ethers.getContractFactory("PoseidonT5", deployer)
    const PoseidonT6Factory = await ethers.getContractFactory("PoseidonT6", deployer)

    const poseidonT3 = await PoseidonT3Factory.deploy();
    const poseidonT4 = await PoseidonT4Factory.deploy();
    const poseidonT5 = await PoseidonT5Factory.deploy();
    const poseidonT6 = await PoseidonT6Factory.deploy();
    let baseERC20Token = await ethers.getContractFactory("BaseERC20Token", deployer)
    token = await baseERC20Token.deploy(100);


    const linkedLibraryAddresses = {
      ["maci-contracts/contracts/crypto/Hasher.sol:PoseidonT5"]: poseidonT5.address,
      ["maci-contracts/contracts/crypto/Hasher.sol:PoseidonT3"]: poseidonT3.address,
      ["maci-contracts/contracts/crypto/Hasher.sol:PoseidonT6"]: poseidonT6.address,
      ["maci-contracts/contracts/crypto/Hasher.sol:PoseidonT4"]: poseidonT4.address,
    }

    //const GrantRoundFactory = await ethers.getContractFactory( "GrantRoundFactory", {
    //  signer: deployer,
    //  libraries: { ...linkedLibraryAddresses }
    //})

      const ConstantInitialVoiceCreditProxyFactory = await ethers.getContractFactory("ConstantInitialVoiceCreditProxy", deployer);
      const constantInitialVoiceCreditProxy = await ConstantInitialVoiceCreditProxyFactory.deploy(0);

      const PollFactoryFactory = await ethers.getContractFactory("PollFactory", {signer: deployer, libraries: {...linkedLibraryAddresses}})
      const pollFactory = await PollFactoryFactory.deploy();

      const FreeForAllGateKeeperFactory = await ethers.getContractFactory("FreeForAllGatekeeper", deployer);
      const freeForAllGateKeeper = await FreeForAllGateKeeperFactory.deploy();
    const MACIFactory = await ethers.getContractFactory("MACI", {signer: deployer, libraries: {...linkedLibraryAddresses}})
    const VKRegistryFactory = await ethers.getContractFactory("VkRegistry", deployer)
    VKRegistry = await VKRegistryFactory.deploy()
    const maci = await MACIFactory.deploy(
        pollFactory.address,
        freeForAllGateKeeper.address,
        constantInitialVoiceCreditProxy.address
      );

    //const coordinator = ethers.Wallet.createRandom()
    //const coordinatorKey = new Keypair()
    ////grantRoundFactory = await GrantRoundFactory.deploy();

    //const grantRoundFactory = await ethers.getContractFactory("GrantRound", deployer)
    //grantRound = await grantRoundFactory.deploy(
    //  1,
    //  coordinator.address,
    //  token.address,
    //  100,
    //  {maxMessages: 5, maxVoteOptions: 5},
    //  {intStateTreeDepth: 1, messageTreeSubDepth:1, messageTreeDepth: 1, voteOptionTreeDepth:1 },
    //  {messageBatchSize: 1, tallyBatchSize: 1},
    //  coordinatorKey.pubKey.asContractParam(),
    //  {maci: maci.address, vkRegistry: VKRegistry.address, messageAq: ""},
    //  VKRegistry.address
    //);
    }
  )

  it('initializes', async () => {
    const deployTransaction = await grantRound.deployTransaction.wait()
    expect(deployTransaction.status).to.not.equal(0);
    expect(deployTransaction.contractAddress).to.equal(grantRound.address);
  })

  it('configured', async () => {
    expect(await grantRound.voiceCreditFactor()).to.equal(1)
    expect(await grantRound.coordinator()).to.equal(coordinator.address)
    expect(await grantRound.nativeToken()).to.equal(token.address)
    expect(await grantRound.recipientRegistry()).to.equal(VKRegistry.address)
  })

  describe('Grant Round', () => {
  
    it('initializes grant round correctly', async () => {
      
    })
  
    describe('accepting contributions', () => {
     
      it('accepts contributions from everyone', async () => {
      })
  
      it('rejects contributions if MACI has not been linked to a round', async () => {
      })
  
      it('limits the number of contributors', async () => {
      })
  
      it('rejects contributions if funding round has been finalized', async () => {
      })
  
      it('rejects contributions with zero amount', async () => {
      })
  
      it('rejects contributions that are too large', async () => {
      })
  
      it('allows to contribute only once per round', async () => {
      })
  
      it('requires approval to transfer', async () => {
      })
  
      it('rejects contributions from unverified users', async () => {
      })
  
      it('should not allow users who have not contributed to sign up directly in MACI', async () => {
      
      })
  
      it('should not allow users who have already signed up to sign up directly in MACI', async () => {
       
      })
  
      it('should not return the amount of voice credits for user who has not contributed', async () => {
      })
    })
  
    describe('voting', () => {
      
  
      it('submits a vote', async () => {
       
      })
  
      it('submits a key-changing message', async () => {
        
      })
  
      it('submits an invalid vote', async () => {
       
      })
  
      it('submits a vote for invalid vote option', async () => {
        
      })
  
      it('submits a batch of messages', async () => {
        
    })
  
    describe('publishing tally hash', () => {
      it('allows coordinator to publish vote tally hash', async () => {
        
      })
  
      it('allows only coordinator to publish tally hash', async () => {
        
      })
  
      it('reverts if round has been finalized', async () => {
       
      })
  
      it('rejects empty string', async () => {
        
      })
    })
  
    describe('finalizing round', () => {
  
      it('allows owner to finalize round', async () => {
       
      })
  
      it('allows owner to finalize round when matching pool is empty', async () => {
        
      })
  
      it('counts direct token transfers to funding round as matching pool contributions', async () => {
        
      })
  
      it('reverts if round has been finalized already', async () => {
        
      })

  
      it('reverts if voting is still in progress', async () => {
       
      })
  
      it('reverts if votes has not been tallied', async () => {
        
      })
  
      it('reverts if tally hash has not been published', async () => {
        
      })
  
      it('reverts if total votes is zero', async () => {
       
      })
  
      it('reverts if total amount of spent voice credits is incorrect', async () => {
        
      })
  
      it('allows only owner to finalize round', async () => {
      })
    })
  
    describe('cancelling round', () => {
      it('allows owner to cancel round', async () => {
      
      })
  
      it('reverts if round has been finalized already', async () => {
       
      })
  
      it('reverts if round has been cancelled already', async () => {
        
      })
  
      it('allows only owner to cancel round', async () => {
        
      })
    })
  
    
  
    describe('claiming funds', () => {
  
      it('allows recipient to claim allocated funds', async () => {
        
      })
  
      it('allows address different than recipient to claim allocated funds', async () => {
        
      })
  
      it('allows recipient to claim zero amount', async () => {
        
      })
  
      it('allows recipient to claim if the matching pool is empty', async () => {
        
      })
  
      it('should not allow recipient to claim funds if round has not been finalized', async () => {
        
      })
  
      it('should not allow recipient to claim funds if round has been cancelled', async () => {
       
      })
  
      it('sends funds allocated to unverified recipients back to matching pool', async () => {
        
      })
  
      it('allows recipient to claim allocated funds only once', async () => {
       
      })
  
      it('should verify that tally result is correct', async () => {
       
      })
  
      it('should verify that amount of spent voice credits is correct', async () => {
        
      })
    })
  })

  describe('cancelling round', () => {

    it('allows owner to cancel round', async () => {
     
    })

    it('allows only owner to cancel round', async () => {
      
    })

    it('reverts if round has not been deployed', async () => {
      
    })

    it('reverts if round is finalized', async () => {
      
    })
  })

  
  })
});
