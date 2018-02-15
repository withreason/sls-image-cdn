
import chai from 'chai';
import parseParams, { paramsToPathString } from '../src/parseParams';
const { expect } = chai;

describe('parseParams', () => {

  describe('parse', () => {
    it('parses url with no params', () =>  {
      const result = parseParams('imageName.jpg');
      expect(result).to.eql({
        key : 'imageName',
        format: 'jpg'
      });
    });

    it('parses url with simple size params', () =>  {
      const result = parseParams('imageName,w_50,h_50.jpg');
      expect(result).to.eql({
        key : 'imageName',
        format: 'jpg',
        width: '50',
        height: '50'
      });
    });

    it('parses filename with dots in', () =>  {
      const result = parseParams('image.name,w_50,h_50.jpg');
      expect(result).to.eql({
        key : 'image.name',
        format: 'jpg',
        width: '50',
        height: '50'
      });
    });

    it('parses filename with underscores in', () =>  {
      const result = parseParams('image_name,w_50,h_50.jpg');
      expect(result).to.eql({
        key : 'image_name',
        format: 'jpg',
        width: '50',
        height: '50'
      });
    });

    it('parses filename with commas in', () =>  {
      const result = parseParams('image,name,w_50,h_50.jpg');
      expect(result).to.eql({
        key : 'image,name',
        format: 'jpg',
        width: '50',
        height: '50'
      });
    });

    it('parses filename in folder', () =>  {
      const result = parseParams('images/name,w_50,h_50.jpg');
      expect(result).to.eql({
        key : 'images/name',
        format: 'jpg',
        width: '50',
        height: '50'
      });
    });

    it('parses params with dots in', () =>  {
      const result = parseParams('imageName,s_0.6.jpg');
      expect(result).to.eql({
        key : 'imageName',
        format: 'jpg',
        ratio: '0.6'
      });
    });

    it('parses url with all params', () =>  {
      const result = parseParams('imageName,b_white,c_yes,e_no,h_50,q_90,r_180,s_0.6,w_50.jpg');
      expect(result).to.eql({
        key : 'imageName',
        format: 'jpg',
        background: 'white',
        crop: 'yes',
        embed: 'no',
        height: '50',
        quality: '90',
        rotate: '180',
        ratio: '0.6',
        width: '50'
      });
    });

    it('parses extension with numbers', () =>  {
      const result = parseParams('imageName.jp3');
      expect(result).to.eql({
        key : 'imageName',
        format: 'jp3'
      });
    });

    it('returns empty object for parse failure', () =>  {
      const result = parseParams('imageNameWithNoExtension');
      expect(result).to.eql({});
    });
  });

  describe('paramsToPathString', () => {
    it('should convert simple params to string', () =>  {
      const pathString = paramsToPathString({
        width: "50",
        height: "50"
      });
      expect(pathString).to.eql('h_50,w_50');
    });

    it('should convert all params to string', () =>  {
      const pathString = paramsToPathString({
        background: 'white',
        crop: 'yes',
        embed: 'no',
        height: '50',
        quality: '90',
        rotate: '180',
        ratio: '0.6',
        width: '50'
      });
      expect(pathString).to.eql('b_white,c_yes,e_no,h_50,q_90,r_180,s_0.6,w_50');
    });
  });
});
