'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '../lib/supabase'
import LoadingOverlay from './LoadingOverlay'

const vehicleSchema = z.object({
  brand: z.string().min(1, 'Enter a brand'),
  model: z.string().min(1, 'Enter a model'),
  trim: z.string().optional(),
  vehicleType: z.string().min(1, 'Enter a vehicle type'),
  transmission: z.string().optional(),
  fuelType: z.string().optional(),
  engineType: z.string().optional(),
  engineCapacity: z.string().optional(),
  mileage: z.number().min(0, 'Mileage cannot be negative'),
  power: z.number().min(0),
  torque: z.number().min(0),
  price: z.number().min(0),
  year: z.number().min(1900).max(new Date().getFullYear()),
  location: z.string().optional(),
  condition: z.string().optional(),
  color: z.string().optional(),
  status: z.string().optional(),
  description: z.string().optional(),
  images: z
    .array(z.instanceof(File))
    .min(1, 'Please upload at least one image'),
})

type VehicleFormValues = z.infer<typeof vehicleSchema>
type VehicleType = 'car' | 'bike' | 'truck' | 'water'

const vehicleData: Record<
  VehicleType,
  { brands: Record<string, string[]> }
> = {
  car: {
    brands: {
      Acura: ['TLX', 'RDX', 'MDX'],
      AlfaRomeo: ['Giulia', 'Stelvio', '4C', 'Giulietta', 'Spider', 'Mito'],
      Audi: ['A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'R8', 'RS3', 'RS4', 'RS5', 'RS6', 'RS7', 'RSQ3', 'RS Q5', 'RS Q7', 'RS Q8'],
      BMW: ['1 Series', '2 Series', '3 Series', '4 Series', '5 Series','6 Series', '7 Series', '8 Series', 'X1', 'X2','X3', 'X4', 'X5', 'X6', 'X7', 'M2', 'M3','M4', 'M5','M6','M8', 'Z4', 'i3', 'i4', 'iX', 'iX3', 'i7'],
      Buick: ['Enclave', 'Encore', 'Regal'],
      Bentley: ['Continental', 'Flying Spur', 'Bentayga', 'Mulsanne'],
      Chevrolet: ['Silverado', 'Equinox', 'Malibu', 'Traverse', 'Tahoe', 'Suburban', 'Colorado', 'Camaro', 'Impala', 'Bolt EV'],
      Chrysler: ['300', 'Pacifica', 'Voyager'],
      Dodge: ['Charger', 'Challenger', 'Durango', 'Journey','Hellcat', 'Viper', 'Demon'],
      Fiat: ['500', 'Panda', 'Tipo', 'Punto', '124 Spider'],
      Ford: ['Focus', 'Mustang', 'F-150', 'Explorer','GT', 'Escape', 'Edge', 'Fusion', 'Ranger', 'Bronco', 'Expedition', 'EcoSport', 'Transit'],
      Ferrari: ['488', 'Portofino', 'F8 Tributo', 'Roma', 'SF90 Stradale', 'LaFerrari', 'California T', 'GTC4Lusso', '812 Superfast', 'F12 Berlinetta'],
      Genesis: ['G70', 'G80', 'GV80'],
      Honda: ['Civic', 'Accord', 'CR-V', 'Pilot', 'Fit', 'HR-V', 'Odyssey', 'Ridgeline', 'Insight', 'Passport'],
      Infiniti: ['Q50', 'Q60', 'QX50', 'QX80'],
      Jaguar: ['XE', 'XF', 'XJ', 'F-Type', 'E-Pace', 'F-Pace'],
      Jeep: ['Wrangler', 'Cherokee', 'Grand Cherokee', 'Renegade', 'Compass', 'Gladiator'],
      Kia: ['Soul', 'Sportage', 'Sorento', 'Optima', 'Forte', 'Telluride', 'Rio'],
      Lamborghini: ['Huracan', 'Aventador', 'Urus', 'Gallardo', 'Diablo', 'Countach', 'Murcielago', 'Espada', 'Islero', 'Jarama','Revuelto'],
      Lexus: ['RX', 'NX', 'ES', 'IS', 'GX', 'LS', 'LX', 'UX', 'LC', 'RC', 'CT'],
      Landrover: ['Range Rover', 'Range Rover Sport', 'Discovery', 'Defender'],
      Mazda: ['Mazda3', 'Mazda6', 'CX-3', 'CX-5', 'CX-9', 'MX-5 Miata'],
      MercedesBenz: ['A-Class', 'B-Class', 'C-Class', 'E-Class', 'S-Class', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS','CLA', 'CLE', 'CLS', 'G-Class', 'SL', 'SLC', 'SLS AMG', 'SLK', 'AMG GT', 'EQC', 'EQB', 'EQA', 'EQE', 'EQS', 'EQV', 'CLK', 'R-Class', 'V-Class', 'X-Class','Vito', 'Sprinter'],
      Mini: ['Cooper', 'Clubman', 'Countryman', 'Convertible'],
      Mitsubishi: ['Outlander', 'Lancer', 'Eclipse Cross', 'Mirage'],
      Nissan: ['Altima', 'Sentra', 'Rogue', 'Murano', 'Pathfinder', 'Frontier', 'Titan', 'Maxima', 'Juke', 'Versa', 'Armada', 'Kicks', 'NV3500', 'Leaf', 'GT-R', '370Z', '350Z', '400Z', 'Xterra'],
      Peugeot: ['208', '308', '3008'],
      Pagani: ['Huayra', 'Zonda'],
      Porsche: ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan', 'Boxster', 'Cayman', '918 Spyder', 'Carrera GT'],
      RollsRoyce: ['Phantom', 'Ghost', 'Wraith', 'Dawn', 'Cullinan', 'Silver Shadow', 'Silver Spirit', 'Silver Cloud'],
      RAM: ['1500', '2500', '3500', 'ProMaster', 'ProMaster City', 'Dakota', 'Rebel', 'TRX', 'Power Wagon', 'Laramie', 'Longhorn', 'Tradesman', 'Warrior', 'Classic', 'SRT-10'],
      Renault: ['Clio', 'Megane', 'Captur', 'Kadjar', 'Talisman'],
      Seat: ['Ibiza', 'Leon', 'Arona'],
      Skoda: ['Octavia', 'Fabia', 'Kodiaq'],
      Smart: ['Fortwo', 'Forfour'],
      Subaru: ['Impreza', 'Legacy', 'Outback', 'Forester', 'Crosstrek', 'Ascent'],
      Tata: ['Nexon', 'Harrier', 'Tiago'],
      Tesla: ['Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck', 'Roadster', 'Model 2', 'Model C', 'Model Y Performance', 'Model S Plaid', 'Model X Plaid', 'Model 3 Performance', 'Model S Long Range', 'Model X Long Range'],
      Toyota: ['Corolla','Allion','Premio','Belta', 'Camry', 'Prius', 'RAV4', 'Highlander', 'Tacoma', 'Tundra', 'Avalon', 'Yaris', 'C-HR', 'Sienna', '4Runner', 'Sequoia', 'Land Cruiser', 'Supra', 'GR86', 'Mirai', 'Hilux', 'Corolla Cross', 'Venza', 'Crown', 'bZ4X', 'GR Yaris', 'GR Supra', 'GR86'],
      Volkswagen: ['Golf', 'Passat', 'Jetta', 'Tiguan', 'Atlas', 'Arteon', 'Beetle', 'ID.4', 'ID.3', 'ID. Buzz', 'T-Cross', 'T-Roc', 'Polo', 'Scirocco', 'CC', 'Touareg', 'Sharan', 'Caravelle'],
      Volvo: ['XC40', 'XC60', 'XC90', 'S60', 'S90', 'V60', 'V90'],
      Lada: ['Niva', 'Granta'],
      Isuzu: ['D-Max', 'MU-X'],
      GreatWall: ['Pajero', 'Steed'],
      MG: ['ZS', 'HS', '5'],
    },
  },
  bike: {
    brands: {
      Aprilia: ['RS 660', 'Tuono 660', 'RSV4', 'Shiver 900'],
      BMW: ['R 1250 GS', 'S 1000 RR', 'F 900 R', 'G 310 R', 'K 1600 GTL', 'R nineT', 'F 750 GS', 'F 850 GS', 'R 18'],
      Buell: ['Blast', 'Lightning', 'Firebolt', 'XB12S'],
      Ducati: ['Panigale V4', 'Monster', 'Scrambler', 'Multistrada', 'Hypermotard', 'Diavel', 'Streetfighter V4', 'Panigale V2', 'DesertX', 'Supersport 950', 'XDiavel', 'Multistrada V4', 'Streetfighter V2', 'Scrambler 1100', 'Panigale V4 S', 'Monster SP', 'Multistrada V4 S', 'Streetfighter V4 SP', 'Diavel V4', 'DesertX Rally'],
      Harleydavidson: ['Street 750', 'Iron 883', 'Fat Boy', 'Road King', 'Sportster', 'Softail', 'Street Glide', 'Road Glide', 'Electra Glide', 'Pan America 1250', 'Nightster', 'Fat Bob', 'Low Rider S', 'Heritage Classic', 'Breakout', 'Roadster', 'Street Bob', 'Fat Bob 114', 'Low Rider ST', 'Road King Special', 'Street Glide Special', 'Road Glide Special', 'Electra Glide Revival'],
      Honda: ['CBR600RR', 'CB500F', 'CRF450R', 'Gold Wing', 'Africa Twin', 'Rebel 500', 'CB650R', 'CB1000R'],
      Kawasaki: ['Ninja ZX-6R', 'Ninja 400', 'Z650', 'Z900', 'Versys 650', 'KLR 650', 'Ninja H2','W800', 'Z900RS', 'Z650RS', 'Ninja 1000SX', 'Versys 1000', 'Z125 Pro', 'KX450F', 'KX250F', 'KLX230'],
      KTM: ['Duke 390', 'RC 390', '1290 Super Duke', '690 Enduro R', '250 SX-F, 1290 Super Adventure', '790 Duke', '250 SX-F', '450 SX-F'],
      Suzuki: ['GSX-R1000', 'SV650', 'V-Strom 650', 'Hayabusa', 'GSX250R'],
      Triumph: ['Street Triple', 'Bonneville T120', 'Tiger 900', 'Speed Triple', 'Scrambler 1200'],
      Yamaha: ['YZF-R3', 'MT-07', 'MT-09', 'Bolt', 'XSR900', 'Tenere 700', 'FZ6', 'FJR1300'],
      Indian: ['Scout', 'Chief', 'Challenger', 'FTR 1200'],
      Royal_enfield: ['Classic 350', 'Himalayan', 'Interceptor 650', 'Continental GT 650'],
      Motoguzzi: ['V85 TT', 'V7 III', 'California Touring'],
      GasGas: ['EC 300', 'MC 125', 'EC 250'],
      Beta: ['RR 300', 'XTrainer 300'],
      Husqvarna: ['Svartpilen 401', 'Vitpilen 701', 'TE 300i'],
      Cfmoto: ['300SR', '650GT', '250NK'],
      Zero: ['SR/F', 'FX', 'DS', 'S'],
    },
  },
  truck: {
    brands: {
      Volvo: ['FH', 'FMX', 'VNL', 'VNR', 'FE', 'FL'],
      Mack: ['Anthem', 'Pinnacle', 'Granite', 'TerraPro', 'LR'],
      Freightliner: ['Cascadia', 'M2 106', 'Coronado', '122SD', '114SD'],
      Kenworth: ['T680', 'W990', 'T880', 'T370', 'K270'],
      Peterbilt: ['579', '389', '567', '520', '367'],
      Isuzu: ['N-Series', 'F-Series', 'Giga', 'Elf', 'D-Max'],
      Western_star: ['4900', '5700XE', '4800', '6900','49X', '47X', '57X'],
      Iveco: ['Stralis', 'Eurocargo', 'Daily', 'S-Way'],
      Scania: ['R-Series', 'S-Series', 'P-Series', 'G-Series', 'L-Series'],
      Daf: ['XF', 'CF', 'LF'],
      Sterling: ['Acterra', 'Bullet', 'L9500'],
      Ford: ['F-650', 'F-750', 'Super Duty', 'L-Series'],
      Chevrolet: ['Silverado HD', 'Express 4500', 'Colorado ZR2'],
      GMC: ['Sierra HD', 'Savana', 'Canyon'],
      Tata: ['Signa', 'Ultra', 'Ace', 'Prima'],
      Hino: ['500 Series', '700 Series', 'Dutro'],
      MAN: ['TGX', 'TGS', 'TGM', 'TGL', 'TGE', 'TGS 18.640', 'TGS 26.640', 'TGS 33.640', 'TGS 41.640'],
    },
  },
 water: {
    brands: {
      YamahaBoats: ['242X', '212X', 'AR190', 'SX190', 'AR250', '195S'],
      Searay: ['SPX 190', 'SLX 250', 'Sundancer 320', 'SDX 250', 'SPX 230'],
      Bayliner: ['Element E18', 'VR5', 'Trophy T20', 'Deck Boat 190'],
      Mastercraft: ['XT23', 'X24', 'NXT22', 'ProStar', 'XStar'],
      BostonWhaler: ['Montauk 170', 'Outrage 250', 'Dauntless 220', 'Vantage 240'],
      Tracker: ['Pro Team 175 TXW', 'Grizzly 2072', 'Topper 1236', 'Bass Tracker Classic XL'],
      Cobalt: ['R6', 'R8 Surf', 'A29', 'CS23', '23SC'],
      Malibu: ['Wakesetter 23 LSV', 'Response TXi', 'M220', 'VLX'],
      Chaparral: ['SSX 287', 'Surf 23', 'SSI 21', 'H2O 19 Sport'],
      Nitro: ['Z21 XL', 'Z19 Pro', 'Z18', 'Z17'],
      Suntracker: ['Party Barge 22', 'SportFish 22', 'Bass Buggy 18'],
      Regal: ['LS6', 'LX2', '36 XO', '26 Express'],
      Fourwinns: ['HD3', 'H2 Surf', 'Vista 275'],
      Moomba: ['Kaiyen', 'Makai', 'Craz', 'Mojo'],
      Axis: ['T220', 'A225', 'A24'],
      Scarab: ['195 ID', '255 Open ID', '165 G'],
      Hurricane: ['SunDeck 2400 OB', 'FunDeck 236 OB'],
      Glastron: ['GT 205', 'GX 190', 'GTD 180'],
      Stingray: ['212SC', '250CR', '236CC'],
      Lund: ['2075 Pro-V', '1875 Impact XS', '1650 Rebel XL'],
      Rangerboats: ['Z521R', 'RT188P', 'Z518', 'Z185'],
      Bennington: ['22 SXSB', '25 RSB', '21 SLX'],
      Supra: ['SA 550', 'SL 450', 'SE 550'],
    },
  },
}

export default function VehicleForm() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      vehicleType: '',
      brand: '',
      model: '',
      trim: '',
      mileage: 0,
      power: 0,
      torque: 0,
      price: 0,
      year: new Date().getFullYear(),
      images: [],
    },
  })

  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [overlayStatus, setOverlayStatus] = useState<'uploading' | 'success' | 'error'>('uploading')
  const [showOverlay, setShowOverlay] = useState(false)

  // Cast vehicleType as VehicleType for type safety
  const vehicleType = watch('vehicleType') as VehicleType
  const selectedBrand = watch('brand')
  const selectedModel = watch('model')

  useEffect(() => {
    setValue('brand', '')
    setValue('model', '')
    setValue('trim', '')
  }, [vehicleType, setValue])

  useEffect(() => {
    setValue('model', '')
    setValue('trim', '')
  }, [selectedBrand, setValue])

  useEffect(() => {
    setValue('trim', '')
  }, [selectedModel, setValue])

  // Safely get brands for selected vehicleType
  const brands = vehicleType && vehicleData[vehicleType]
    ? Object.keys(vehicleData[vehicleType].brands)
    : []

  // Safely get models for selected brand
  const models =
    vehicleType &&
    selectedBrand &&
    vehicleData[vehicleType]?.brands[selectedBrand]
      ? vehicleData[vehicleType].brands[selectedBrand]
      : []

  // Preview uploaded images
  const images = watch('images')
  useEffect(() => {
    if (!images || images.length === 0) {
      setImagePreviews([])
      return
    }
    const urls = Array.from(images).map((file) => URL.createObjectURL(file))
    setImagePreviews(urls)
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [images])

  const handleOverlayClose = () => {
    setShowOverlay(false)
    if (overlayStatus === 'success') {
      // Reset form on successful upload
      reset()
      setImagePreviews([])
    }
    setUploadError(null)
  }

async function onSubmit(data: VehicleFormValues) {
  setUploading(true)
  setUploadError(null)
  setShowOverlay(true)
  setOverlayStatus('uploading')

  const uploadedImageUrls: string[] = []

  try {
    console.log('📤 Starting upload process...')
    console.log('📦 Form data:', data)

    const files = data.images as File[]
    for (const file of files) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`

      console.log(`📁 Uploading file: ${file.name} as ${fileName}`)

      const { error: uploadError } = await supabase.storage
        .from('vehicle-images')
        .upload(fileName, file)

      if (uploadError) {
        console.error('❌ Upload error:', uploadError)
        throw uploadError
      }

      const { data: urlData, error: urlError } = supabase.storage
        .from('vehicle-images')
        .getPublicUrl(fileName);

      if (urlError) {
        console.error('❌ Failed to get public URL:', urlError);
        throw urlError;
      }

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL from upload');
      }

      console.log(`✅ Public URL obtained: ${urlData.publicUrl}`)
      uploadedImageUrls.push(urlData.publicUrl)
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    console.log('👤 Authenticated user:', user)
    if (userError || !user?.id) {
      console.error('❌ Failed to retrieve user or user ID is missing')
      throw new Error('User is not authenticated or ID missing.')
    }

    const vehiclePayload = {
      brand: data.brand,
      model: data.model,
      trim: data.trim,
      type: data.vehicleType,
      transmission: data.transmission,
      fuel_type: data.fuelType,
      engine_type: data.engineType,
      engine_capacity: data.engineCapacity,
      mileage: data.mileage,
      power_hp: data.power,
      torque_nm: data.torque,
      price: data.price,
      year: data.year,
      location: data.location,
      condition: data.condition,
      color: data.color,
      description: data.description,
      images: uploadedImageUrls,
      status: data.status || 'listed',
      user_id: user.id,
      created_at: new Date().toISOString(),
    }

    console.log('🚀 Attempting to insert vehicle with payload:', vehiclePayload)

    const { error: insertError } = await supabase
      .from('vehicles')
      .insert(vehiclePayload)

    if (insertError) {
      console.error('❌ Insert error:', insertError)
      throw insertError
    }

    console.log('✅ Vehicle successfully inserted')
    setOverlayStatus('success')
  } catch (error: unknown) {
    console.error('🚨 Final catch block error:', error)
    setOverlayStatus('error')

    if (typeof error === 'object' && error !== null) {
      if ('message' in error && typeof (error as { message?: string }).message === 'string') {
        setUploadError((error as { message: string }).message)
      } else if ('code' in error && typeof (error as { code?: string }).code === 'string') {
        setUploadError(`Error code ${(error as { code: string }).code}`)
      } else {
        setUploadError('An unexpected error occurred.')
      }
    } else {
      setUploadError('An unexpected error occurred.')
    }
  } finally {
    console.log('📦 Upload complete')
    setUploading(false)
  }
}

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Vehicle Type */}
        <div>
          <label className="block font-semibold mb-1">Vehicle Type</label>
          <select {...register('vehicleType')} className="input w-full" defaultValue="">
            <option value="" disabled>
              Select a type
            </option>
            <option value="car">Car</option>
            <option value="bike">Bike</option>
            <option value="truck">Truck</option>
            <option value="water">Watercraft</option>
          </select>
          {errors.vehicleType && (
            <p className="text-red-600 text-sm mt-1">{errors.vehicleType.message}</p>
          )}
        </div>

        {/* Brand */}
        <div>
          <label className="block font-semibold mb-1" htmlFor="brand">
            Brand
          </label>
          <select
            {...register('brand')}
            id="brand"
            className="input w-full"
            defaultValue=""
            disabled={!vehicleType}
          >
            <option value="" disabled>
              {vehicleType ? 'Select brand' : 'Select vehicle type first'}
            </option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand.charAt(0).toUpperCase() + brand.slice(1).replace(/-/g, ' ')}
              </option>
            ))}
          </select>
          {errors.brand && (
            <p className="text-red-600 text-sm mt-1">{errors.brand.message}</p>
          )}
        </div>

        {/* Model */}
        <div>
          <label className="block font-semibold mb-1" htmlFor="model">
            Model
          </label>
          <select
            {...register('model')}
            id="model"
            className="input w-full"
            defaultValue=""
            disabled={!selectedBrand}
          >
            <option value="" disabled>
              {selectedBrand ? 'Select model' : 'Select brand first'}
            </option>
            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
          {errors.model && (
            <p className="text-red-600 text-sm mt-1">{errors.model.message}</p>
          )}
        </div>

        {/* Trim */}
        <div>
          <label className="block font-semibold mb-1" htmlFor="trim">
            Trim
          </label>
          <input
            {...register('trim')}
            id="trim"
            type="text"
            placeholder="Enter trim (optional)"
            className="input w-full"
            disabled={!selectedModel}
          />
        </div>

        {/* Mileage */}
        <div>
          <label className="block font-semibold mb-1">Mileage (km)</label>
          <input
            type="number"
            {...register('mileage', { valueAsNumber: true })}
            className="input w-full"
          />
          {errors.mileage && (
            <p className="text-red-600 text-sm mt-1">{errors.mileage.message}</p>
          )}
        </div>
        {/* Condition */}
        <div>
          <label className="block font-semibold mb-1">Condition</label>
          <select {...register('condition')} className="input w-full">
            <option value="">Select condition</option>
            <option value="new">New</option>
            <option value="used">Used</option>
            <option value="damaged">Damaged</option>
            <option value="repaired">Repaired</option>
          </select>
        </div>
        {/* Transmission */}
        <div>
          <label className="block font-semibold mb-1">Transmission</label>
          <select {...register('transmission')} className="input w-full">
            <option value="">Select transmission</option>
            <option value="manual">Manual</option>
            <option value="automatic">Automatic</option>
            <option value="CVT">CVT</option>
            <option value="semi-automatic">Semi-Automatic</option>
          </select>
        </div>
        {/* Engine Type */}
        <div>
          <label className="block font-semibold mb-1">Engine Type</label>
          <select {...register('engineType')} className="input w-full">
            <option value="">Select engine type</option>
            <option value="Flat-6">Flat-6</option>
            <option value="Flat-4">Flat-4</option>
            <option value="inline-4">Inline-4</option>
            <option value="inline-5">Inline-5</option>
            <option value="inline-6">Inline-6</option>
            <option value="V4">V4</option>
            <option value="V6">V6</option>
            <option value="V8">V8</option>
            <option value="V10">V10</option>
            <option value="V12">V12</option>
            <option value="electric">Electric</option>
          </select>
        </div>
        {/* Engine Capacity */}
        <div>
          <label className="block font-semibold mb-1">Engine Capacity</label>
          <input
            {...register('engineCapacity')}
            type="text"
            placeholder="e.g. 2.0L, 1500cc"
            className="input w-full"
          />
        </div>
        {/* Fuel Type */}
        <div>
          <label className="block font-semibold mb-1">Fuel Type</label>
          <select {...register('fuelType')} className="input w-full">
            <option value="">Select fuel type</option>
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Electric</option>
            <option value="hybrid">Hybrid</option>
            <option value="CNG">CNG</option>
          </select>
        </div>
        {/* Power and Torque */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Power (HP)</label>
            <input
              type="number"
              {...register('power', { valueAsNumber: true })}
              className="input w-full"
            />
            {errors.power && (
              <p className="text-red-600 text-sm mt-1">{errors.power.message}</p>
            )}
          </div>
          <div>
            <label className="block font-semibold mb-1">Torque (Nm)</label>
            <input
              type="number"
              {...register('torque', { valueAsNumber: true })}
              className="input w-full"
            />
            {errors.torque && (
              <p className="text-red-600 text-sm mt-1">{errors.torque.message}</p>
            )}
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block font-semibold mb-1">Price (ZMW)</label>
          <input
            type="number"
            {...register('price', { valueAsNumber: true })}
            className="input w-full"
          />
          {errors.price && (
            <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>
          )}
        </div>

        {/* Year */}
        <div>
          <label className="block font-semibold mb-1">Year</label>
          <input
            type="number"
            {...register('year', { valueAsNumber: true })}
            min={1900}
            max={new Date().getFullYear()}
            className="input w-full"
          />
          {errors.year && (
            <p className="text-red-600 text-sm mt-1">{errors.year.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold mb-1">Description</label>
          <textarea
            {...register('description')}
            rows={4}
            className="input w-full"
            placeholder="Add any additional details about your vehicle"
          />
        </div>
          {/* Color */}
        <div>
          <label className="block font-semibold mb-1">Color</label>
          <input
            {...register('color')}
            type="text"
            placeholder="e.g. Black, Silver"
            className="input w-full"
          />
        </div>
        {/* Location */}
        <div>
          <label className="block font-semibold mb-1">Location</label>
          <input
            {...register('location')}
            type="text"
            placeholder="e.g. Lusaka, Dubai"
            className="input w-full"
          />
        </div>
        {/* Image Upload */}
        <div>
          <label className="block font-semibold mb-1">Upload Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              const files = e.target.files
              if (!files) return
              setValue('images', Array.from(files))
            }}
            className="input w-full"
          />
          {errors.images && (
            <p className="text-red-600 text-sm mt-1">{errors.images.message}</p>
          )}
        </div>

        {/* Image previews */}
          {imagePreviews.map((src, i) => (
            <Image
              key={i}
              src={src}
              alt={`Preview ${i + 1}`}
              width={96}
              height={96}
              className="w-24 h-24 object-cover rounded border"
              style={{ objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
            />
          ))}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || uploading}
          className="bg-black text-white px-6 py-3 rounded disabled:opacity-50 hover:bg-gray-800 transition-colors"
        >
          {isSubmitting || uploading ? 'Uploading...' : 'List Vehicle'}
        </button>

        {/* Upload error */}
        {uploadError && !showOverlay && (
          <p className="text-red-600 mt-2 font-semibold">{uploadError}</p>
        )}
      </form>

      {/* Loading Overlay */}
      <LoadingOverlay
        isVisible={showOverlay}
        status={overlayStatus}
        message={uploadError}
        onClose={handleOverlayClose}
      />
    </>
  )
}