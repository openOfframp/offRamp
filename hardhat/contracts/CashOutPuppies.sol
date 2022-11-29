// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract CashOutPuppies is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint256 private _maxSupply = 100;
    string public _baseURL;

    constructor() ERC721("PUFF PUFF", "CASHPUPPIES") {}

    function mint(address _to) external onlyOwner {
        require(
            _tokenIds.current() < _maxSupply,
            "Can not mint more than max supply"
        );
        _safeMint(_to, _tokenIds.current());
        _tokenIds.increment();
    }

    function setBaseURL(string memory baseURI) public onlyOwner {
        _baseURL = baseURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseURL;
    }

    function maxSupply() public view returns (uint256) {
        return _maxSupply;
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }
}
