import { useState, useEffect } from "react";
import { ethers } from "ethers";
import ABI from './../abi/SupplyChain.json'

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";


const useSupplyChain = () =>{
    const [contract, setContract] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function init(){
            try{
                if(!window.ethereum){
                    setError("Please install MetaMask");
                    return;
                }
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, signer);
                setContract(contractInstance);

            }catch(error){
                setError(error.message);
            }
        }
        init();
    }, []);

    const getProduct = async (id) =>{
        try{
            if(!contract) return;
            const product = await contract.products(id);
            return product;
        }catch(error){
            setError(error.message);
        }
    }

    const getHistory = async (id) => {
        try{
            if(!contract) return;
            const history = await contract.getHistory(id);
            return history;
        }catch(error){
            setError(error.message);
        }
    }

    const createProduct = async (cid) => {
        try{
            if(!contract) return;
            const tx = await contract.createProduct(cid);
            const receipt = await tx.wait();
            return receipt;
        }catch(error){
            setError(error.message);
        }
    }

    return { contract, error, getProduct, getHistory, createProduct };
}

export default useSupplyChain;