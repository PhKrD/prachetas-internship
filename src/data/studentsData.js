/* Deterministic pseudo-random so stats are consistent across reloads */
const sr = (seed) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

const toSlug = (name) =>
  name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

/* Real student names by batch */
const rawBatches = [
  /* Batch 1 */ [
    'Ishaan Mudkhedkar','Sharwil Shimpi','Yuvraj Shingate','Chaitanya Sankpal',
    'Aryan Khairkhar','Shambhavi Sachin Jagtap','Supriya Kumari','Amruta Shriramjwar',
    'Sayali Vishwanath Pukale','Vignesh Yogesh Jadhav','Arnav Tejas Padhye',
    'Hanmant Nagnath Hembade','Abhinav Wadhwa','Devaashish Pranav Vaidya',
    'Gandhar Prashant Tawade','Harshwardhan Jagtap','Diya Mehul Metha',
    'Janak Sharad Rahudkar','Meet Vinay Gupta','Sujal Eknath Jadhao',
    'Ashutosh Amit Saxena','Prajwal Ravindra Bendre','Nehal Gandhi',
    'Ishwari Vijay Patil','Ashvin Vishnu Wanjare','Devansh Dwivedi',
    'Shalaka Kudale','Yash Ramprasad Ambhure','Mukul Manohar Bhosale',
    'Chinmay Vikas Chavan','Binitmani Umeshmani Tripathi','Prathmesh Shrikant Darokar',
    'Nihal Rajesh Bhatia','Aaditya Mahesh Narkhedkar','Dipali Balaji Lokhande',
    'Aditi Satish Sawant','Alina Wadhwani','Kalyani Gajanan Jaybhaye',
    'Astha Gupta','Isha Trikutkar','Niraj Kailas Jadhao',
    'Nayan Daulat Suryawanshi','Savari Vishwas Satav','Yash Bhavale',
    'Atharva Nilesh Mohite','Nikhil Shripad Patankar','Vijay Shivram Prajapati',
    'Anvi Pravin Mokal','Vinita Dattatray Kulkarni','Aadya Shah','Aaditya Ashok Ghule',
  ],
  /* Batch 2 */ [
    'Yash Kaloni','Yugal Sandip Bhortake','Akshit Rajesh','Hrucha Sandeshkumar Shinde',
    'Suryansh Pandey','Vishal Venkatesh Bhat','Harsh Pravin Gosavi','Parth Patil',
    'Prajwal Gautam Narwade','Siya Powar','Adwait Prasad Zanjurne','Parshad Sachin Nale',
    'Nehal Deepak Chaudhari','Parth Sachin Nale','Priyesh Sunil Patil',
    'Riddhi Sachin Bendale','Anannya Mirkute','Aman Vinayak Nirmal',
    'Sanjana Anand Ijeri','Soha Dnyaneshwar Borchate','Mayank Singh Bhadouria',
    'Shravan Jitendra More','Rohak Prashant Zalke','Shital Mallinath Pujari',
    'Antara Mukherjee','Samarth Samarth Galande','Saksham Nilesh Patil',
    'Aryan Prashant Gore','Sai Rajeev Hotha','Darsheel Dhammanand Nagrale',
    'Sarthak Neeraj Bhaskar','Ronnit Kasat','Suhani Pratapsinh More',
    'Keshav Pazhayannur','Tanvi Pawar','Aditya Kedar Bavadekar',
    'Sanaa Vikram Joshi','Shruti Santosh Lonkar','Swaraali Jaydeep Joshi',
    'Shravani Dhorey','Himanshu Rushiraj Chouhan','Avaneesh Sudhir Muthal',
    'Janhavi Ghose','Mrudula Vinay Nisal','Vaishnavi Gorakhnath Misal',
    'Hasnain Bohari','Rupak Shivdarshan Ambekar','Mrunmayi Anandkumar Londhe',
    'Shirley Daulatkar','Rushabh Bhairavnath Varule','Khushi Bansal',
  ],
  /* Batch 3 */ [
    'Rohit Manish Jain','Arnav M Katepallewar','Lakshya Mahesh Mithapalli',
    'Parag Navnit Patil','Aryan Sanjay Pol','Anaya Sandeep Gore',
    'Rishabh Manish Rathi','Ishaan Sonawane','Hrida Pattanshetti',
    'Preesha Manoj Motwani','Archit Manoj Deshpande','Ranjeet Jeevan Wakde',
    'Sanchit Baburao Farakate','Aastha Rajesh Patange','Aalap Talegaonkar',
    'Burhanuddin Yusuf Dalal','Rohan Ramdas Dome','Saket Anand Joshi',
    'Sai S Heralgi','Hayyan Hayyur Rehman Shaikh','Megharani Rajendra Gore',
    'Harsh Jaising Yadav','Soham Rajkumar Vibhute','Divij Sandeep Banavali',
    'Atharva Sharma','Saish Vijay Sargar','Charvi Vijaykumar Mulay',
    'Areen Yatin Valsangkar','Tanishk Amit Badal','Divya Baban Sambherao',
    'Shrinivas Digambar Pande','Ashutosh Kumar','Aditya Uddhav Tekale',
    'Redekar Savani Vijay','Krishna Nitin Khilare','Rucha Ganesh Dasnam',
    'Aditya Ramchandra Deshpande','Janhvi Mukund Sahare','Abhinav Kokate',
    'Ayush Adesh Kamble','Purva Mahesh Joshi',
  ],
  /* Batch 4 */ [
    'Sanika Vishnu Awatade','Aarya Paresh Nimkar','Chaitanya Vaishampayan',
    'Himanshu Ramesh Pujari','Vedant Makarand Ranmale','Keshav Ganesh Miniyar',
    'Dhruva Satpute','Atharva Kamble','Pranjal Dattatray Hile',
    'Shourya Mohite','Nidhi Vishwakarma','Bhargav Gorane','Aryan Santosh Divekar',
    'Manav Dhanraj Rachetti','Utkarsh Umashankar Gupta','Amogh Abhay Kulkarni',
    'Shreyak Girish Kadam','Shrihan Kedar Kulkarni','Ashish Arwade',
    'Raj Desai','Yashwardhan Bhame','Prathamesh Santosh More','Arush Ashish Kalawar',
    'Atharva Hemant Desai','Paritosh Prasanna Arkadi','Swapnali Santosh Mali',
    'Dnyaneshwari Jalindar Jadhav','Shivam Santosh Gole','Amol Mahesh Bhoye',
    'Parth Prashant Baride','Karan Mahadev Kadam','Alok Madhav Kadam',
    'Atharv S Jadhav','Harshit Ramesh Shirol','Harshit Sandip Gahukar',
    'Mitali Rohan Bhindwale','Aryan Ganesh Kale','Ruturaj Rushikesh Dhotre',
    'Avishkar Karande','Pransh Govind Chandak',
  ],
]

/* Build flat list */
const rawList = rawBatches.flatMap((names, bi) =>
  names.map(name => ({ name, batch: bi + 1 }))
)

/* Detect slug duplicates across all students */
const slugCount = {}
rawList.forEach(s => {
  const base = toSlug(s.name)
  slugCount[base] = (slugCount[base] || 0) + 1
})

/* Generate unique slugs: append batch number only for duplicates */
const slugUsed = {}
const rawWithSlugs = rawList.map(s => {
  const base = toSlug(s.name)
  let slug = slugCount[base] > 1 ? `${base}-b${s.batch}` : base
  /* Further dedup within same batch (edge case) */
  if (slugUsed[slug]) slug = `${slug}-2`
  slugUsed[slug] = true
  return { ...s, slug }
})

/* Assign IDs and roll numbers — stats start at 0, real data fetched from Neon DB */
const batchCounters = { 1: 0, 2: 0, 3: 0, 4: 0 }
export const studentsData = rawWithSlugs.map((s, i) => {
  batchCounters[s.batch]++
  const pos = batchCounters[s.batch]
  return {
    id:                   i + 1,
    name:                 s.name,
    batch:                s.batch,
    slug:                 s.slug,
    rollNo:               `COEP-B${s.batch}-${String(pos).padStart(2, '0')}`,
    donorsCollected:      0,
    donorTarget:          100,
    sipConversions:       0,
    totalAmountCollected: 0,
    sipMonthlyAmount:     0,
    donors:               [],
  }
})

export const batchMeta = [
  { id:1, name:'Batch 1', gradFrom:'from-orange-400', gradTo:'to-orange-600', lightBg:'bg-orange-50', border:'border-orange-200', text:'text-orange-700', badge:'bg-orange-100 text-orange-800', ring:'ring-orange-400' },
  { id:2, name:'Batch 2', gradFrom:'from-blue-400',   gradTo:'to-blue-600',   lightBg:'bg-blue-50',   border:'border-blue-200',   text:'text-blue-700',   badge:'bg-blue-100 text-blue-800',   ring:'ring-blue-400'   },
  { id:3, name:'Batch 3', gradFrom:'from-emerald-400',gradTo:'to-emerald-600',lightBg:'bg-emerald-50',border:'border-emerald-200',text:'text-emerald-700',badge:'bg-emerald-100 text-emerald-800',ring:'ring-emerald-400'},
  { id:4, name:'Batch 4', gradFrom:'from-violet-400', gradTo:'to-violet-600', lightBg:'bg-violet-50', border:'border-violet-200', text:'text-violet-700', badge:'bg-violet-100 text-violet-800', ring:'ring-violet-400' },
  { id:5, name:'Others',  gradFrom:'from-gray-400',    gradTo:'to-gray-600',    lightBg:'bg-gray-50',    border:'border-gray-200',    text:'text-gray-700',    badge:'bg-gray-100 text-gray-800',    ring:'ring-gray-400'    },
]

export const getBatchMeta = (students) => {
  const hasOthers = students.some(s => s.batch === 5)
  return hasOthers ? batchMeta : batchMeta.slice(0, 4)
}
