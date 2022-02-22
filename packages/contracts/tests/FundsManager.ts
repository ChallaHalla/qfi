import { ethers, waffle} from 'hardhat';
import { BaseERC20Token } from "../typechain/BaseERC20Token";
import { Signer } from "ethers";
import chai from 'chai';
import { solidity } from 'ethereum-waffle';
import { FundsManager } from "../typechain/FundsManager";
import { GrantRoundFactory } from "../typechain/GrantRoundFactory";
import deployGrantRound from "./helpers/DeployGrantRound";
import { PoseidonT3 } from "../typechain/PoseidonT3";
import { PoseidonT3__factory } from "../typechain/factories/PoseidonT3__factory";
import { PoseidonT4 } from "../typechain/PoseidonT4";
import { PoseidonT4__factory } from "../typechain/factories/PoseidonT4__factory";
import { PoseidonT5 } from "../typechain/PoseidonT5";
import { PoseidonT5__factory } from "../typechain/factories/PoseidonT5__factory";
import { PoseidonT6 } from "../typechain/PoseidonT6";
import { PoseidonT6__factory } from "../typechain/factories/PoseidonT6__factory";



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
    token = await BaseERC20TokenFactory.deploy(50);
  })

  it('verify - initializes properly', async () => {
    expect((await fundsManager.deployTransaction.wait()).status).to.not.equal(0);
    fundsManager.address

  })

  it('verify - configured properly', async () => {
    const provider = waffle.provider;
    expect(await provider.getCode(fundsManager.address)).to.not.equal("0x")
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
    await token.transfer(await addr1.getAddress(), 50);
    await token.connect(addr1).transfer(fundsManager.address, 50);
    expect(await token.balanceOf(fundsManager.address)).to.equal(50)

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


      const RecipientRegistryFactory = await ethers.getContractFactory("OptimisticRecipientRegistry", deployer)

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
    console.log(VKRegistry)


    const maci = await MACIFactory.deploy(
      pollFactory.address,
      freeForAllGateKeeper.address,
      constantInitialVoiceCreditProxy.address
    );
      const grantRound = grantRoundFactory.deployGrantRound(
            1,
            coordinator.address,
            token.address,
            100,
            {maxMessages: 1, maxVoteOptions: 1},
            {intStateTreeDepth: 1, messageTreeSubDepth: 1, messageTreeDepth: 1, voteOptionTreeDepth: 1},
            {messageBatchSize: 1, tallyBatchSize: 1},
            //HOW TO structure a public key?
            //NOTE look at qfi test now
            {  x: 1, y: 1 },
            VKRegistry.address,
            maci.address,
            grantRoundFactory.address
        );

    })
    
    it('returns the amount of available matching funding', async () => {
      
    })

    it('pulls funds from funding source', async () => {
      
    })

    it('pulls funds from funding source if allowance is greater than balance', async () => {
      
    })

    
  })



})
