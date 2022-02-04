import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import { nftaddress, nftmarketaddress } from "../../config";
import NFT from "../../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import Nav from "../Nav";
import { Link } from "react-router-dom";
import CartaNft from "../CartaNft";
import detectEthereumProvider from "@metamask/detect-provider";
import Swal from "sweetalert2";
import meta from "../../img/MetaMask_Fox.png"

export default function MyAssets() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    try{
         //validacion para verificar si metamask esta instalado
    const provider1 = await detectEthereumProvider();
    if (!provider1) {
      Swal.fire({
        imageUrl: `${meta}`,
        title: "Debes Instalar metamask..",
        width: 500,
        confirmButtonText: "Continuar",
        imageWidth: 300,
        imageHeight: 400,
        timer: 3000,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
        },
      });
    
    } else {
      console.log("metamask instalado"); 
        //--------------------------------------------------
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    })
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      signer
    );
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const data = await marketContract.fetchMyNFTs();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          name: meta.data.name,
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          description: meta.data.description,
        };
        return item;
      })
    );
    console.log("Items desde Mis NFT", items);
    setNfts(items);
    setLoadingState("loaded");
    }
    }catch{
      setNfts([])
      }
  }
  // if (loadingState === 'loaded' && !nfts.length) return (<h1>No assets owned</h1>)
  return (
    <div>
      {nfts?.map((nft, i) => (
        <div className="cart-tienda" key={i}>
          <CartaNft nft={nft} transaccion={"venta"} />
        </div>
      ))}
    </div>
  );
}