'use client';
import { ConfigProvider } from 'antd';
import { ConnectButton, Connector, zh_CN } from '@ant-design/web3';
import { WagmiWeb3ConfigProvider, MetaMask, Mainnet } from '@ant-design/web3-wagmi';
import { createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
const wallets = [MetaMask()];
const chains = [Mainnet];
const config = createConfig({
  ssr: true,
  chains: [mainnet],
  connectors: [injected({ target: 'metaMask' })],
  transports: { [mainnet.id]: http() },
});
export default function Wallet() {
  return <ConfigProvider theme={{ token: { colorPrimary: '#F25A1A', borderRadius: 8, fontFamily: 'inherit' } }}>
    <WagmiWeb3ConfigProvider config={config} wallets={wallets} chains={chains} locale={zh_CN} eip6963={{ autoAddInjectedWallets: true }} walletConnect={false}>
      <Connector modalProps={{ title: '连接你的钱包', mode: 'simple' }}>
        <ConnectButton className="wallet-connect" type="text" size="middle" quickConnect={false}>连接钱包</ConnectButton>
      </Connector>
    </WagmiWeb3ConfigProvider>
  </ConfigProvider>;
}
