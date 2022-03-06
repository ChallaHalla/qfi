import { ethers, waffle} from 'hardhat';
import { Signer } from "ethers";
import { BaseERC20Token__factory } from "../../typechain/factories/BaseERC20Token__factory";
import { BaseERC20Token } from "../../typechain/BaseERC20Token";
import { QFI } from "../../typechain/QFI";
import { OptimisticRecipientRegistry__factory } from "../../typechain/factories/OptimisticRecipientRegistry__factory";
import getPoseidonLibraries from "./GetPoseidonLibraries"
import { QFI__factory } from "../../typechain/factories/QFI__factory";
import { PollFactory__factory, PollFactoryLibraryAddresses } from "../../typechain/factories/PollFactory__factory";
import { FreeForAllGatekeeper__factory } from "../../typechain/factories/FreeForAllGatekeeper__factory";
import { ConstantInitialVoiceCreditProxy__factory } from "../../typechain/factories/ConstantInitialVoiceCreditProxy__factory";

export default async function deployQFI(deployer: Signer): Promise<QFI>{
    const linkedLibraryAddresses = await getPoseidonLibraries(deployer)

    const GrantRoundFactory = await ethers.getContractFactory( "GrantRoundFactory", {
      signer: deployer,
      libraries: { ...linkedLibraryAddresses }
    });
    const BaseERC20TokenFactory = new BaseERC20Token__factory(deployer);
    const baseERC20Token = await BaseERC20TokenFactory.deploy(100);
    const RecipientRegistryFactory = new OptimisticRecipientRegistry__factory(deployer);
    const optimisticRecipientRegistry = await RecipientRegistryFactory.deploy(0, 0, await deployer.getAddress());
    const grantRoundFactory = await GrantRoundFactory.deploy();
    grantRoundFactory.setRecipientRegistry(optimisticRecipientRegistry.address);


    const QFIFactory = new QFI__factory({ ...linkedLibraryAddresses }, deployer);
    const PollFactoryFactory = new PollFactory__factory({ ...linkedLibraryAddresses }, deployer);
    const pollFactory = await PollFactoryFactory.deploy();

    const FreeForAllGateKeeperFactory = new FreeForAllGatekeeper__factory(deployer);
    const freeForAllGateKeeper = await FreeForAllGateKeeperFactory.deploy();
    const ConstantInitialVoiceCreditProxyFactory = new ConstantInitialVoiceCreditProxy__factory(deployer);
    const constantInitialVoiceCreditProxy = await ConstantInitialVoiceCreditProxyFactory.deploy(0);




    return QFIFactory.deploy(
      baseERC20Token.address,
      grantRoundFactory.address,
      pollFactory.address,
      freeForAllGateKeeper.address,
      constantInitialVoiceCreditProxy.address
    )
}
