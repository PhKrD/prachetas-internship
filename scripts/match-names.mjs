import { studentsData } from '../src/data/studentsData.js'

const groupsToMatch = {
  1: {
    'No crumbs left': ['Yash Bhawle', 'Atharva Mohite', 'Isha Trikutkar', 'Alina Wadhwani'],
    'Prayaas': ['Kalyani Jaybhaye', 'Dipali Lokhande', 'Ishwari Patil', 'Aditi Sawant'],
    'Los Blancos': ['Mukul Bhosale', 'Chinmay Chava', 'Nayan Suryawanshi', 'Vignesh Jadhav'],
    'Clovers': ['Shambhavi Jagtap', 'Amruta Shriramjwar', 'Supriya Kumari', 'Savari Satav'],
    'Team Rocket': ['Devaashish Vaidya', 'Meet Gupta', 'Harshwardhan Jagtap', 'Gandhar Tawade'],
    'Team Hysteresis': ['Devansh Dwivedi', 'Ashutosh Amit Saxena', 'Abhinav Wadhwa', 'Diya Mehul Mehta'],
    'Team YSA': ['Yash Ambhure', 'Sharwil Shimpi', 'Aryan Khairkhar'],
    'Dhurandhar': ['Arnav Padhye', 'Prajwal Bendre', 'Nikhil Patankar', 'Janak Rahudkar'],
    'Apex': ['Yuvraj Shingat', 'Chaitanya Sankpan', 'Aaditya Ghule', 'Hanumamant Hembade'],
    'Behind The Cause': ['Nihal Bhatia', 'Binit Tripathi', 'Prathmesh Darokar', 'Vijay Prajapati'],
    'Sankalp': ['Anvi Mokal', 'Vinita Kulkarni', 'Aadya Shah', 'Sayali Pukale'],
    'Team SAN': ['Nehal Gandhi', 'Astha Gupta', 'Shalaka Kudale'],
    'Serve Coorps': ['Neeraj Jadhavo', 'Sujal Jadhavo', 'Ashwin Wanjare']
  },
  2: {
    'Majboor Majdoor': ['Aman Nirmal', 'Himanshu Chauhan', 'Swaraali Joshi', 'Shruti Lonkar'],
    'WAAA': ['Sai Rajeev', 'Aryan Gore', 'Anannya Mirkute', 'Swayam Bankar'],
    'Ashaa': ['Yash Kaloni', 'Akshit Rajesh', 'Suryansh Pandey', 'Yugal Bhortake'],
    'Spark': ['Mrudula Nisal', 'Suhani More', 'Ridhi Bendale', 'Sheetal Pujari'],
    'Veer': ['Vishal Bhat', 'Tanvi Pawar', 'Keshav Pazhayannur', 'Aditya Bavadekar'],
    'Helping Hands': ['Prajwal Narwade', 'Adwait Zanjurne', 'Parth Patil', 'Harsh Gosavi'],
    'The Benevolents': ['Priyesh Patil', 'Parth Nale', 'Nehal Chaudri', 'Parshad Nale'],
    'Aether Cause': ['Purva Joshi', 'Rohak', 'Antara', 'Hrucha'],
    'Quartermelon': ['Sanjana Ijeri', 'Soha Borchate', 'Shravani Dhorey', 'Shravan More'],
    'Umeed': ['Rushab Varuni', 'Jahnvi Ghose', 'Mrunmayi Londhe', 'Hasnain Bohari'],
    'ARAM': ['Avaneesh Muthal', 'Mayank Singh', 'Ronnit Kasat', 'Rupak Ambekar']
  },
  3: {
    'Liability': ['Rishabh Rathi', 'Ishaan Sonawane'],
    'Mountain': ['Sai Heralgi', 'Sanket Joshi', 'Aalap Talegaokar', 'Rohan Dome'],
    'We Rise': ['Burhanuddie', 'Hayyan', 'Ayush Kamble'],
    'Better Tomorrow': ['Rucha Dasnam', 'Savani Redekar', 'Janhvi Sahare', 'Vaishnavi Misal'],
    'P3': ['Abhinav Kokte', 'Aditya Tekala', 'Sanchit Farakate'],
    'Hope X': ['Krishna Khilare', 'Charvi Mulay', 'Aastha Patange'],
    'Visionaries': ['Lakshya Mithapalli', 'Parag Patil', 'Arnav Katepallewar'],
    'Hope Horizon': ['Aryan Pol', 'Aaditya Narkhedkar', 'Samarth Galande', 'Tanishk Badal'],
    'Fund Fusion': ['Saish Sargar', 'Divij Banavali', 'Rohit Jain']
  }
}

const findBestMatch = (memberName, studentsList) => {
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/)
  const memberWords = norm(memberName)
  
  let best = null
  let maxScore = 0
  
  for (const s of studentsList) {
    const studentWords = norm(s.name)
    // Score based on overlapping words (ignoring length-1 words)
    let score = 0
    for (const w1 of memberWords) {
      if (w1.length <= 1) continue
      for (const w2 of studentWords) {
        if (w1 === w2 || w1.includes(w2) || w2.includes(w1)) {
          score += 1
          if (w1 === w2) score += 1 // Exact word match bonus
        }
      }
    }
    if (score > maxScore) {
      maxScore = score
      best = s
    }
  }
  
  if (maxScore >= 2) {
    return { student: best, score: maxScore }
  }
  return null
}

console.log('--- SMART MATCHING REPORT ---')
const finalMapping = {}
for (const [batch, groups] of Object.entries(groupsToMatch)) {
  console.log(`\nBatch ${batch}:`)
  const batchStudents = studentsData.filter(s => s.batch === Number(batch))
  
  for (const [groupName, members] of Object.entries(groups)) {
    console.log(`  Group: ${groupName}`)
    finalMapping[groupName] = []
    for (const member of members) {
      const match = findBestMatch(member, batchStudents)
      if (match) {
        console.log(`    - "${member}" matches "${match.student.name}" (slug: "${match.student.slug}", score: ${match.score})`)
        finalMapping[groupName].push(match.student.slug)
      } else {
        // Try global search
        const globalMatch = findBestMatch(member, studentsData)
        if (globalMatch) {
          console.log(`    - [CROSS-BATCH] "${member}" matches "${globalMatch.student.name}" (batch: ${globalMatch.student.batch}, slug: "${globalMatch.student.slug}", score: ${globalMatch.score})`)
          finalMapping[groupName].push(globalMatch.student.slug)
        } else {
          console.log(`    - [!] "${member}" HAS NO MATCH ANYWHERE`)
        }
      }
    }
  }
}

console.log('\n--- FINAL GROUP DATA OBJECT ---')
console.log(JSON.stringify(finalMapping, null, 2))
