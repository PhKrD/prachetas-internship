/* Deterministic pseudo-random so data is consistent across reloads */
const sr = (seed) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

const firstNames = [
  'Aarav','Arjun','Rahul','Vikram','Rohan','Siddharth','Kartik','Nikhil',
  'Pranav','Akash','Dhruv','Aditya','Varun','Ankit','Omkar','Tejas',
  'Sahil','Gaurav','Mayur','Amit','Vivek','Sanket','Yogesh','Pratik',
  'Rishabh','Vishal','Sachin','Nitin','Soham','Shubham','Abhishek','Nilesh',
  'Rushikesh','Prathamesh','Vedant','Aniket','Atharva','Kedar','Prasad','Vaibhav',
  'Priya','Pooja','Neha','Sneha','Shruti','Ankita','Rasika','Sonali',
  'Apurva','Swati','Rutuja','Sanjana','Pallavi','Ashwini','Smita','Kavita',
  'Sakshi','Manasi','Vrushali','Vaishnavi','Gauri','Devyani','Sheetal','Aarti',
  'Rohini','Komal','Nisha','Archana','Divya','Isha','Jyoti','Mrunali',
  'Namrata','Poonam','Aditi','Bhakti','Chaitrali','Gunjan','Tejashri','Meghna',
  'Nandita','Pratiksha','Rashmi','Sampada','Tejaswini','Ujwala','Varsha','Aishwarya',
  'Yuvraj','Bharat','Dhananjay','Ishaan','Onkar','Raunak','Sameer','Umesh',
  'Sushant','Madhav','Ashish','Ajit','Chetan','Kunal','Amol','Jayesh',
  'Hemant','Tanmay','Devendra','Chinmay','Siddhesh','Bhushan','Kapil','Deepak',
  'Lalit','Girish','Dinesh','Sagar','Manish','Karan','Sunil','Harish',
  'Rajesh','Prashant','Yash','Suresh','Ravi','Tushar','Sumit','Swapnil',
  'Vijay','Pavan','Lokesh','Ganesh','Santosh','Rupesh','Vipul','Chintamani',
  'Madhuri','Damini','Esha','Savita','Tanuja','Uma','Veena','Yamini',
  'Bharati','Dhanashri','Chandrika','Falguni','Geeta','Harsha','Indira','Kalpana',
  'Lata','Ranjana','Sunita','Bhavana','Chhaya','Ekta','Deepika','Manisha',
]

const lastNames = [
  'Patil','Shinde','Desai','Kulkarni','Jadhav','More','Suryawanshi','Kamble',
  'Pawar','Gaikwad','Salunke','Bhosale','Kale','Deshpande','Joshi','Naik',
  'Sawant','Wagh','Mane','Chavan','Thorat','Dongre','Wankhede','Bhandari',
  'Pande','Varma','Gupta','Sharma','Singh','Kumar','Yadav','Mehta',
  'Shah','Patel','Iyer','Nair','Reddy','Rao','Mishra','Tiwari',
  'Verma','Raut','Lokhande','Kharat','Bhavsar','Gondhalekar','Nimkar','Pendse',
]

const depts = ['Computer Engg.','Mechanical Engg.','Civil Engg.','Electronics Engg.','Instrumentation','Chemical Engg.']

const generateStudents = () =>
  Array.from({ length: 180 }, (_, i) => {
    const r = (o) => sr(i * 17 + o)
    const batch = Math.floor(i / 45) + 1
    const donors   = Math.floor(r(1) * 80 + 12)
    const sipCount = Math.floor(donors * (r(2) * 0.40 + 0.15))
    const avgDon   = Math.floor(r(3) * 350 + 100)
    const avgSip   = Math.floor(r(4) * 300 + 100)

    return {
      id: i + 1,
      name: `${firstNames[Math.floor(r(5) * firstNames.length)]} ${lastNames[Math.floor(r(6) * lastNames.length)]}`,
      batch,
      rollNo:     `COEP-B${batch}-${String((i % 45) + 1).padStart(2, '0')}`,
      department: depts[Math.floor(r(7) * depts.length)],
      donorsCollected:     donors,
      donorTarget:         100,
      sipConversions:      sipCount,
      totalAmountCollected: donors * avgDon,
      sipMonthlyAmount:    sipCount * avgSip,
    }
  })

export const studentsData = generateStudents()

export const batchMeta = [
  { id:1, name:'Batch Alpha', gradFrom:'from-orange-400', gradTo:'to-orange-600', lightBg:'bg-orange-50', border:'border-orange-200', text:'text-orange-700', badge:'bg-orange-100 text-orange-800', ring:'ring-orange-400' },
  { id:2, name:'Batch Beta',  gradFrom:'from-blue-400',   gradTo:'to-blue-600',   lightBg:'bg-blue-50',   border:'border-blue-200',   text:'text-blue-700',   badge:'bg-blue-100 text-blue-800',   ring:'ring-blue-400'   },
  { id:3, name:'Batch Gamma', gradFrom:'from-emerald-400',gradTo:'to-emerald-600',lightBg:'bg-emerald-50',border:'border-emerald-200',text:'text-emerald-700',badge:'bg-emerald-100 text-emerald-800',ring:'ring-emerald-400'},
  { id:4, name:'Batch Delta', gradFrom:'from-violet-400', gradTo:'to-violet-600', lightBg:'bg-violet-50', border:'border-violet-200', text:'text-violet-700', badge:'bg-violet-100 text-violet-800', ring:'ring-violet-400' },
]
