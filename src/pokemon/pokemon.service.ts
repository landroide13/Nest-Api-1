import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {

  constructor( 
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
    ){}


  async create(createPokemonDto: CreatePokemonDto) {

    createPokemonDto.name = createPokemonDto.name.toLowerCase();

    try {

      const pokemon = await this.pokemonModel.create(createPokemonDto)
      return pokemon;

    } catch (error) {
      this.handlerExeptions(error);
    }
    
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {

    let pokemon: Pokemon;

    if( !isNaN(+term)){
      pokemon = await this.pokemonModel.findOne({ no: term })
    }

    if(isValidObjectId(term)){
      pokemon = await this.pokemonModel.findById(term);
    }

    if(!pokemon){
      pokemon = await this.pokemonModel.findOne( { name: term })
    }

    if(!pokemon) throw new NotFoundException(`Pokemon with id, no, or name ${ term } not found..`);

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne(term);

    if( updatePokemonDto.name )
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();


    try {

      await pokemon.updateOne(updatePokemonDto, { new: true })
      return { ...pokemon.toJSON(), ...updatePokemonDto };
      
    } catch (error) {
      this.handlerExeptions(error);
    }
  }

  async remove(id: string) {
    //const res = await this.pokemonModel.findByIdAndDelete( id );
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
    //return `Pokemon removed ${ {res} }`
    if(deletedCount === 0){
      throw new BadRequestException(`Pokemon with id ${id}, Not found.`)
    }
    return 'Pokemon deleted.';
  }

  private handlerExeptions(error: any){

    if(error.code === 11000){
      throw new BadRequestException(`Pokemon already exist, try a new one..`)
    }
    console.log(error);
    throw new InternalServerErrorException(`Can't create Pokemon`)

  }
  
}
