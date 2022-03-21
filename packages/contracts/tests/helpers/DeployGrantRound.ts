import { ethers } from "hardhat";
import { Signer } from "ethers";
import getPoseidonLibraries from "./GetPoseidonLibraries"
import { PoseidonT3 } from "../../typechain/PoseidonT3";
import { PoseidonT3__factory } from "../../typechain/factories/PoseidonT3__factory";
import { PoseidonT4 } from "../../typechain/PoseidonT4";
import { PoseidonT4__factory } from "../../typechain/factories/PoseidonT4__factory";
import { PoseidonT5 } from "../../typechain/PoseidonT5";
import { PoseidonT5__factory } from "../../typechain/factories/PoseidonT5__factory";
import { PoseidonT6 } from "../../typechain/PoseidonT6";
import { PoseidonT6__factory } from "../../typechain/factories/PoseidonT6__factory";
import { GrantRound } from "../../typechain/GrantRound";
import { PubKey, PrivKey, Keypair } from "maci-domainobjs";
import { BaseERC20Token } from "../../typechain/BaseERC20Token";

export default async function deployGrantRound(deployer: Signer, token: BaseERC20Token, coordinator: Signer): Promise<GrantRound>{

      const BaseERC20TokenFactory = await ethers.getContractFactory("BaseERC20Token", deployer)
      const linkedLibraryAddresses = await getPoseidonLibraries(deployer);

      const grantRoundFactory = await ethers.getContractFactory("GrantRound", {
        signer: deployer,
        libraries: { ...linkedLibraryAddresses }
      });

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

      const messageAq = await MessageAqFactoryFactory.deploy();

      const coordinatorKey = new Keypair()
      return grantRoundFactory.deploy(
        1,
        await coordinator.getAddress(),
        token.address,
        100,
        {maxMessages: 5, maxVoteOptions: 5},
        {intStateTreeDepth: 1, messageTreeSubDepth: 1, messageTreeDepth: 1, voteOptionTreeDepth: 1},
        {messageBatchSize: 1, tallyBatchSize: 1},
        coordinatorKey.pubKey.asContractParam(),
        {vkRegistry: VKRegistry.address, maci: maci.address, messageAq: messageAq.address},
        VKRegistry.address,
      );
}
