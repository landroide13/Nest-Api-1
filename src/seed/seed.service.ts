import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
//import axios, { AxiosInstance } from 'axios';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Pokeres } from './interfaces/poke-res.interface';


@Injectable()
export class SeedService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,

    private readonly http: AxiosAdapter
  ){}

  //private readonly axios: AxiosInstance = axios;

  async executeSeed(){

    await this.pokemonModel.deleteMany({});

    const data = await this.http.get<Pokeres>('https://pokeapi.co/api/v2/pokemon?limit=650');

    const pokemonToInsert: { name:string, no:number }[] = [];

    data.results.forEach(({ name, url}) => {
      const segments = url.split('/');
      const no = +segments[ segments.length - 2];

      //const pokemon = await this.pokemonModel.create({ name, no })

      pokemonToInsert.push({ name, no })
      console.log({ name, no });
    })

    await this.pokemonModel.insertMany( pokemonToInsert );
    //console.log(data);
    return 'Seed Executed';
  }
  
}
