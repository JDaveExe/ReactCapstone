import React, { useState, useContext, useEffect } from 'react';
import { Card, Accordion, Button, Container, Modal, Form, Row, Col } from 'react-bootstrap';
import DateTimeContext from '../contexts/DateTimeContext';
import CheckUpContext from '../contexts/CheckUpContext';
import { useCheckupAnalytics } from '../contexts/CheckupAnalyticsContext';
import ChartSimulationModal from './ChartSimulationModal';
import axios from 'axios';
import '../styles/Asettings.css';

const Asettings = () => {  const { simulatedDate, setSimulationDate, isSimulated } = useContext(DateTimeContext);
  const { resetTodaysCheckUps } = useContext(CheckUpContext);
  const { resetTestCheckups } = useCheckupAnalytics();
  
  const [showDateTimeModal, setShowDateTimeModal] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [showChartSimulationModal, setShowChartSimulationModal] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(null);
  
  // Chart Simulation States
  const [simulationConfig, setSimulationConfig] = useState({
    days: 30,
    pattern: 'random',
    minValue: 0,
    maxValue: 20,
    trend: 'upward',
    variance: 'medium'
  });
  
  // Vaccine Management States
  const [showVaccineModal, setShowVaccineModal] = useState(false);
  const [vaccineFormData, setVaccineFormData] = useState({
    name: '',
    description: '',
    ageGroup: '',
    dosage: '',
    manufacturer: '',
    batchNumber: '',
    expiryDate: '',
    stock: 0
  });
  const [vaccineLoading, setVaccineLoading] = useState(false);
  const [vaccineSuccess, setVaccineSuccess] = useState(null);
  
  // Medication Management States
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [medicationFormData, setMedicationFormData] = useState({
    name: '',
    type: '',
    strength: '',
    form: '',
    manufacturer: '',
    batchNumber: '',
    expiryDate: '',
    stock: 0,
    description: ''
  });  const [medicationLoading, setMedicationLoading] = useState(false);
  const [medicationSuccess, setMedicationSuccess] = useState(null);

  // Prescription Template States
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateFormData, setTemplateFormData] = useState({
    name: '',
    category: '',
    description: '',
    medications: '',
    instructions: '',
    duration: '',
    notes: ''
  });  const [templateLoading, setTemplateLoading] = useState(false);
  const [templateSuccess, setTemplateSuccess] = useState(null);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);  // User Management States
  const [showUserModal, setShowUserModal] = useState(false);
  const [showUserListModal, setShowUserListModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);  const [userFormData, setUserFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'doctor',
    position: ''
  });
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [userSuccess, setUserSuccess] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [selectedRole, setSelectedRole] = useState('all');

  // Inventory Modal States
  const [showVaccineInventoryModal, setShowVaccineInventoryModal] = useState(false);
  const [showMedicationInventoryModal, setShowMedicationInventoryModal] = useState([]);
  
  // Dynamic inventory states
  const [vaccineInventory, setVaccineInventory] = useState([]);
  const [medicationInventory, setMedicationInventory] = useState([]);
  // Vaccine options from VaccinationCheck.js - Comprehensive list
  const vaccineOptions = [
    { id: 1, name: "BCG (Bacillus Calmette-Guérin)", description: "Administered at birth to prevent tuberculosis." },
    { id: 2, name: "Hepatitis B Vaccine", description: "Given at birth and as part of the Pentavalent vaccine series." },
    { id: 3, name: "Pentavalent Vaccine (DTP-HepB-Hib)", description: "Protects against diphtheria, tetanus, pertussis, hepatitis B, and Haemophilus influenzae type B; administered at 6, 10, and 14 weeks." },
    { id: 4, name: "Oral Polio Vaccine (OPV)", description: "Given at 6, 10, and 14 weeks, with boosters at 9 months and 4–6 years." },
    { id: 5, name: "Inactivated Polio Vaccine (IPV)", description: "Given at 14 weeks and 9 months." },
    { id: 6, name: "Pneumococcal Conjugate Vaccine (PCV)", description: "Administered at 6, 10, and 14 weeks, with a booster at 12–15 months." },
    { id: 7, name: "Measles, Mumps, and Rubella (MMR) Vaccine", description: "First dose at 9 months, second at 12–15 months, and a third at 4–6 years." },
    { id: 8, name: "Japanese Encephalitis (JE) Vaccine", description: "Given at 12 months." },
    { id: 9, name: "Influenza Vaccine", description: "First dose at 6 months, with annual boosters." },
    { id: 10, name: "Rotavirus Vaccine", description: "Administered orally starting at 6 weeks, depending on the vaccine type." },
    { id: 11, name: "Rabies Vaccine", description: "Recently included in the routine immunization schedule." },
    { id: 12, name: "Tetanus Toxoid (TT)", description: "Given to pregnant women and for wound management." },
    { id: 13, name: "Tetanus-Diphtheria (Td)", description: "Booster vaccine for adolescents and adults." },
    { id: 14, name: "Tetanus-Diphtheria-Pertussis (Tdap)", description: "Booster vaccine with pertussis component." },
    { id: 15, name: "Varicella (Chickenpox) Vaccine", description: "Prevents chickenpox, typically given at 12-15 months." },
    { id: 16, name: "Hepatitis A Vaccine", description: "Protects against hepatitis A virus." },
    { id: 17, name: "Meningococcal Vaccine", description: "Protects against meningococcal disease." },
    { id: 18, name: "Human Papillomavirus (HPV) Vaccine", description: "Prevents cervical cancer, given to adolescents." },
    { id: 19, name: "Yellow Fever Vaccine", description: "Required for travel to endemic areas." },
    { id: 20, name: "Typhoid Vaccine", description: "Protects against typhoid fever." },
    { id: 21, name: "Cholera Vaccine", description: "Oral vaccine for cholera prevention." },
    { id: 22, name: "Dengue Vaccine (Dengvaxia)", description: "For prevention of dengue fever in endemic areas." },
    { id: 23, name: "Pneumococcal Polysaccharide Vaccine (PPSV23)", description: "For adults and high-risk individuals." },
    { id: 24, name: "Haemophilus influenzae type b (Hib) Vaccine", description: "Standalone Hib vaccine when needed." },
    { id: 25, name: "Anthrax Vaccine", description: "For high-risk occupational exposure." },
    { id: 26, name: "Smallpox Vaccine", description: "For emergency preparedness." },
    { id: 27, name: "Shingles (Zoster) Vaccine", description: "Prevents shingles in older adults." },
    { id: 28, name: "COVID-19 mRNA Vaccine (Pfizer)", description: "mRNA vaccine against SARS-CoV-2." },
    { id: 29, name: "COVID-19 mRNA Vaccine (Moderna)", description: "mRNA vaccine against SARS-CoV-2." },
    { id: 30, name: "COVID-19 Viral Vector Vaccine (AstraZeneca)", description: "Viral vector vaccine against SARS-CoV-2." },
    { id: 31, name: "COVID-19 Viral Vector Vaccine (Johnson & Johnson)", description: "Single-dose viral vector vaccine." },
    { id: 32, name: "COVID-19 Protein Subunit Vaccine (Novavax)", description: "Protein subunit vaccine against SARS-CoV-2." },
    { id: 33, name: "Respiratory Syncytial Virus (RSV) Vaccine", description: "Protects against RSV in infants and elderly." }
  ];
  // Medication options from Sessions.js - Comprehensive list
  const medicationOptions = [
    // Analgesics & Antipyretics
    "Paracetamol 500mg tablet", "Paracetamol 250mg/5mL syrup", "Paracetamol 100mg/mL drops",
    "Ibuprofen 400mg tablet", "Ibuprofen 100mg/5mL syrup", "Aspirin 325mg tablet",
    "Mefenamic Acid 500mg tablet", "Mefenamic Acid 250mg/5mL syrup", "Diclofenac 50mg tablet",
    "Tramadol 50mg tablet", "Codeine 30mg tablet", "Morphine 10mg/mL injection",
    
    // Antibiotics
    "Amoxicillin 500mg capsule", "Amoxicillin 250mg/5mL suspension", "Amoxicillin 500mg/5mL suspension",
    "Amoxicillin + Clavulanic Acid 625mg tablet", "Amoxicillin + Clavulanic Acid 228mg/5mL suspension",
    "Azithromycin 500mg tablet", "Azithromycin 200mg/5mL suspension", "Clarithromycin 500mg tablet",
    "Erythromycin 500mg tablet", "Erythromycin 250mg/5mL syrup", "Cephalexin 500mg capsule",
    "Cephalexin 250mg/5mL suspension", "Ciprofloxacin 500mg tablet", "Ciprofloxacin 250mg/5mL suspension",
    "Metronidazole 500mg tablet", "Metronidazole 250mg/5mL suspension", "Cotrimoxazole 960mg tablet",
    "Cotrimoxazole 240mg/5mL suspension", "Clindamycin 300mg capsule", "Doxycycline 100mg capsule",
    "Tetracycline 500mg capsule", "Ampicillin 500mg capsule", "Gentamicin 80mg/2mL injection",
    
    // Anti-inflammatory & Steroids
    "Hydrocortisone 100mg/mL injection", "Prednisolone 5mg tablet", "Prednisolone 15mg/5mL syrup",
    "Dexamethasone 4mg tablet", "Dexamethasone 4mg/mL injection", "Methylprednisolone 4mg tablet",
    "Betamethasone 0.5mg tablet", "Triamcinolone 4mg tablet",
    
    // Cardiovascular Medications
    "Metoprolol 50mg tablet", "Amlodipine 5mg tablet", "Enalapril 10mg tablet",
    "Losartan 50mg tablet", "Atenolol 50mg tablet", "Carvedilol 25mg tablet",
    "Furosemide 40mg tablet", "Hydrochlorothiazide 25mg tablet", "Digoxin 0.25mg tablet",
    "Nifedipine 10mg tablet", "Captopril 25mg tablet", "Spironolactone 25mg tablet",
    "Simvastatin 20mg tablet", "Atorvastatin 20mg tablet", "Clopidogrel 75mg tablet",
    
    // Respiratory Medications
    "Salbutamol 2mg/5mL syrup", "Salbutamol 100mcg inhaler", "Ambroxol 30mg/5mL syrup",
    "Ambroxol 30mg tablet", "Bromhexine 8mg tablet", "Dextromethorphan 15mg/5mL syrup",
    "Guaifenesin 100mg/5mL syrup", "Ipratropium bromide inhaler", "Beclomethasone inhaler",
    "Budesonide inhaler", "Fluticasone inhaler", "Montelukast 10mg tablet",
    "Theophylline 200mg tablet", "Carbocisteine 375mg capsule",
    
    // Gastrointestinal Medications
    "Aluminum Magnesium (Antacid) 200mg/200mg/20mg per 5mL", "Omeprazole 20mg capsule",
    "Ranitidine 150mg tablet", "Famotidine 20mg tablet", "Lansoprazole 30mg capsule",
    "Domperidone 10mg tablet", "Metoclopramide 10mg tablet", "Simethicone 40mg tablet",
    "Loperamide 2mg capsule", "Bismuth subsalicylate 262mg tablet", "Sucralfate 1g tablet",
    "Hyoscine butylbromide 10mg tablet", "Oral Rehydration Salts (ORS)", "Hydrite (ORS)",
    
    // Vitamins & Supplements
    "Folic Acid 5mg tablet", "Iron + Folic Acid (IFA) tablet", "Ferrous Sulfate 325mg tablet",
    "Vitamin A 100,000 IU capsule", "Vitamin A 200,000 IU capsule", "Vitamin B-Complex tablet",
    "Vitamin B12 1000mcg injection", "Vitamin C 100mg chewable tablet", "Vitamin C 500mg tablet",
    "Vitamin C drops", "Vitamin C syrup", "Ascorbic Acid 100mg chewable tablet",
    "Ascorbic Acid 250mg/5mL syrup", "Vitamin D3 1000 IU tablet", "Vitamin E 400 IU capsule",
    "Calcium carbonate 500mg tablet", "Multivitamins drops", "Multivitamins syrup",
    "Multivitamins + Iron drops", "Multivitamins + Iron syrup", "Zinc sulfate 20mg tablet",
    "Magnesium oxide 400mg tablet", "Potassium chloride 600mg tablet",
    
    // Antihistamines & Allergies
    "Cetirizine 10mg tablet", "Cetirizine 5mg/5mL syrup", "Loratadine 10mg tablet",
    "Loratadine 5mg/5mL syrup", "Diphenhydramine 25mg capsule", "Chlorpheniramine 4mg tablet",
    "Fexofenadine 120mg tablet", "Desloratadine 5mg tablet",
    
    // Dermatological
    "Hydrocortisone 1% cream", "Betamethasone 0.1% cream", "Clotrimazole 1% cream",
    "Miconazole 2% cream", "Ketoconazole 2% cream", "Mupirocin 2% ointment",
    "Calamine lotion", "Zinc oxide ointment", "Petroleum jelly", "Silver sulfadiazine 1% cream",
    
    // Endocrine & Diabetes
    "Metformin 500mg tablet", "Glibenclamide 5mg tablet", "Insulin NPH 100 IU/mL",
    "Insulin Regular 100 IU/mL", "Levothyroxine 50mcg tablet", "Methimazole 5mg tablet",
    "Propylthiouracil 50mg tablet",
    
    // Neurological & Psychiatric
    "Phenytoin 100mg capsule", "Carbamazepine 200mg tablet", "Valproic acid 250mg tablet",
    "Diazepam 5mg tablet", "Lorazepam 1mg tablet", "Haloperidol 5mg tablet",
    "Risperidone 2mg tablet", "Fluoxetine 20mg capsule", "Sertraline 50mg tablet",
    "Amitriptyline 25mg tablet", "Gabapentin 300mg capsule",
    
    // Herbal & Traditional
    "Lagundi 300mg tablet", "Lagundi 600mg tablet", "Sambong 250mg capsule",
    "Tsaang Gubat capsule", "Yerba Buena capsule", "Malunggay capsule",
    
    // Ophthalmic
    "Chloramphenicol 0.5% eye drops", "Tobramycin 0.3% eye drops", "Artificial tears",
    "Prednisolone 1% eye drops", "Timolol 0.5% eye drops",
    
    // Otic (Ear)
    "Neomycin + Polymyxin B ear drops", "Ciprofloxacin 0.3% ear drops",
    
    // Emergency & Critical Care
    "Epinephrine 1mg/mL injection", "Atropine 1mg/mL injection", "Dopamine 40mg/mL injection",
    "Naloxone 0.4mg/mL injection", "Hydrocortisone 100mg injection", "Diazepam 5mg/mL injection",
    
    // Contraceptives
    "Ethinylestradiol + Levonorgestrel tablet", "Medroxyprogesterone 150mg injection",
    "Condoms", "Emergency contraceptive pill",
    
    // Anti-parasitic
    "Mebendazole 100mg tablet", "Albendazole 400mg tablet", "Metronidazole 250mg tablet",
    "Ivermectin 6mg tablet", "Praziquantel 600mg tablet"
  ];

  // Custom modal styles for dark theme
  const modalLabelStyle = { 
    color: '#38bdf8', 
    fontSize: '14px', 
    marginBottom: '4px', 
    display: 'block',
    fontWeight: '500'
  };
  
  const modalInputStyle = {
    background: '#1e293b',
    color: '#e5e7eb',
    border: '1px solid #334155',
    borderRadius: '6px',
    padding: '10px',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box'
  };
  
  const modalSelectStyle = {
    background: '#1e293b',
    color: '#e5e7eb',
    border: '1px solid #334155',
    borderRadius: '6px',
    padding: '10px',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box'
  };
  
  const modalTextAreaStyle = {
    background: '#1e293b',
    color: '#e5e7eb',
    border: '1px solid #334155',
    borderRadius: '6px',
    padding: '10px',
    fontSize: '14px',
    width: '100%',
    minHeight: '80px',
    resize: 'vertical',
    boxSizing: 'border-box'
  };

  const requiredStyle = {
    color: '#ef4444',
    marginLeft: '2px',
    fontSize: '14px'
  };

  // Vaccine Management Handlers
  const handleVaccineFormChange = (e) => {
    const { name, value, type } = e.target;
    setVaccineFormData({
      ...vaccineFormData,
      [name]: type === 'number' ? Number(value) : value
    });
  };
  const handleAddVaccine = async () => {
    setVaccineLoading(true);
    setVaccineSuccess(null);

    try {
      // Create new vaccine object
      const newVaccine = {
        id: Date.now(),
        name: vaccineFormData.name,
        batchNumber: vaccineFormData.batchNumber,
        stock: vaccineFormData.stock,
        expiryDate: vaccineFormData.expiryDate,
        manufacturer: vaccineFormData.manufacturer,
        status: vaccineFormData.stock === 0 ? 'Out of Stock' : 
                vaccineFormData.stock < 50 ? 'Low Stock' : 'In Stock',
        dateAdded: new Date().toISOString()
      };

      // Simulate API call
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true, data: newVaccine });
        }, 1000);
      });

      // Add to inventory
      setVaccineInventory(prev => [...prev, newVaccine]);

      setVaccineSuccess({
        status: 'success',
        message: 'Vaccine added successfully!',
        details: `${vaccineFormData.name} has been added to the vaccine inventory.`
      });

      // Reset form
      setVaccineFormData({
        name: '',
        description: '',
        ageGroup: '',
        dosage: '',
        manufacturer: '',
        batchNumber: '',
        expiryDate: '',
        stock: 0
      });

      // Close modal after 2 seconds
      setTimeout(() => setShowVaccineModal(false), 2000);
    } catch (error) {
      console.error('Error adding vaccine:', error);
      setVaccineSuccess({
        status: 'error',
        message: 'Failed to add vaccine',
        details: error.message
      });
    } finally {
      setVaccineLoading(false);
    }
  };

  // Medication Management Handlers
  const handleMedicationFormChange = (e) => {
    const { name, value, type } = e.target;
    setMedicationFormData({
      ...medicationFormData,
      [name]: type === 'number' ? Number(value) : value
    });
  };
  const handleAddMedication = async () => {
    setMedicationLoading(true);
    setMedicationSuccess(null);

    try {
      // Create new medication object
      const newMedication = {
        id: Date.now(),
        name: medicationFormData.name,
        batchNumber: medicationFormData.batchNumber,
        stock: medicationFormData.stock,
        expiryDate: medicationFormData.expiryDate,
        manufacturer: medicationFormData.manufacturer,
        status: medicationFormData.stock === 0 ? 'Out of Stock' : 
                medicationFormData.stock < 50 ? 'Low Stock' : 'In Stock',
        dateAdded: new Date().toISOString()
      };

      // Simulate API call
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true, data: newMedication });
        }, 1000);
      });

      // Add to inventory
      setMedicationInventory(prev => [...prev, newMedication]);

      setMedicationSuccess({
        status: 'success',
        message: 'Medication added successfully!',
        details: `${medicationFormData.name} has been added to the medication inventory.`
      });

      // Reset form
      setMedicationFormData({
        name: '',
        type: '',
        strength: '',
        form: '',
        manufacturer: '',
        batchNumber: '',
        expiryDate: '',
        stock: 0,
        description: ''
      });

      // Close modal after 2 seconds
      setTimeout(() => setShowMedicationModal(false), 2000);
    } catch (error) {
      console.error('Error adding medication:', error);
      setMedicationSuccess({
        status: 'error',
        message: 'Failed to add medication',
        details: error.message
      });
    } finally {
      setMedicationLoading(false);
    }
  };

  // Prescription Template Handlers
  const handleTemplateSubmit = async (e) => {
    e.preventDefault();
    setTemplateLoading(true);
    
    try {
      const newTemplate = {
        id: Date.now(),
        ...templateFormData,
        createdAt: new Date().toISOString()
      };
      
      // Save to localStorage for persistence
      const existingTemplates = JSON.parse(localStorage.getItem('prescriptionTemplates') || '[]');
      const updatedTemplates = [...existingTemplates, newTemplate];
      localStorage.setItem('prescriptionTemplates', JSON.stringify(updatedTemplates));
      
      setSavedTemplates(updatedTemplates);
      setTemplateSuccess('Template saved successfully!');
      setTemplateFormData({
        name: '',
        category: '',
        description: '',
        medications: '',
        instructions: '',
        duration: '',
        notes: ''
      });
      
      setTimeout(() => {
        setTemplateSuccess(null);
        setShowTemplateModal(false);
      }, 2000);
    } catch (error) {
      console.error('Error saving template:', error);
      setTemplateSuccess('Error saving template. Please try again.');
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleTemplateChange = (e) => {
    const { name, value } = e.target;
    setTemplateFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const loadTemplate = (template) => {
    // This would integrate with the prescription system in Sessions.js
    // For now, we'll show an alert with the template details
    alert(`Loading template: ${template.name}\n\nMedications:\n${template.medications}\n\nInstructions: ${template.instructions}`);
  };

  const deleteTemplate = (templateId) => {
    const updatedTemplates = savedTemplates.filter(t => t.id !== templateId);
    setSavedTemplates(updatedTemplates);
    localStorage.setItem('prescriptionTemplates', JSON.stringify(updatedTemplates));
  };
  // Load saved templates on component mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('prescriptionTemplates') || '[]');
    setSavedTemplates(saved);
  }, []);

  // Initialize inventories with sample data
  useEffect(() => {
    setVaccineInventory(sampleVaccineInventory);
    setMedicationInventory(sampleMedicationInventory);
  }, []);

  const templateCategories = [
    'Acute Infections',
    'Chronic Conditions',
    'Pediatric Care',
    'Pain Management',
    'Mental Health',
    'Cardiovascular',
    'Respiratory',
    'Gastrointestinal',
    'Dermatology',
    'Other'
  ];

  const preBuiltTemplates = [
    {
      id: 'template_urti',
      name: 'Upper Respiratory Tract Infection',
      category: 'Acute Infections',
      description: 'Common cold/flu treatment for adults',
      medications: 'Paracetamol 500mg - Take 1-2 tablets every 6 hours as needed\nIbuprofen 400mg - Take 1 tablet every 8 hours with food\nLoratadine 10mg - Take 1 tablet daily',
      instructions: 'Rest and increase fluid intake. Complete the course even if symptoms improve.',
      duration: '5-7 days',
      notes: 'Return if symptoms worsen or persist beyond 7 days'
    },
    {
      id: 'template_hypertension',
      name: 'Hypertension Management',
      category: 'Cardiovascular',
      description: 'Basic hypertension treatment',
      medications: 'Amlodipine 5mg - Take 1 tablet daily in the morning\nLisinopril 10mg - Take 1 tablet daily',
      instructions: 'Monitor blood pressure regularly. Take medications at the same time daily.',
      duration: 'Ongoing',
      notes: 'Monthly follow-up for blood pressure monitoring'
    },
    {
      id: 'template_pediatric_fever',
      name: 'Pediatric Fever Management',
      category: 'Pediatric Care',
      description: 'Fever treatment for children',
      medications: 'Paracetamol (Child dose) - As per weight chart every 6 hours\nIbuprofen (Child dose) - As per weight chart every 8 hours',
      instructions: 'Alternate paracetamol and ibuprofen if needed. Ensure adequate hydration.',      duration: '3-5 days',
      notes: 'Seek immediate care if fever exceeds 40°C or child appears unwell'
    }
  ];

  // Sample inventory data
  const sampleVaccineInventory = [
    {
      id: 1,
      name: "BCG (Bacillus Calmette-Guérin)",
      batchNumber: "BCG2024001",
      stock: 150,
      expiryDate: "2025-12-31",
      manufacturer: "Serum Institute",
      status: "In Stock"
    },
    {
      id: 2,
      name: "Hepatitis B Vaccine",
      batchNumber: "HepB2024002",
      stock: 80,
      expiryDate: "2025-08-15",
      manufacturer: "GSK",
      status: "Low Stock"
    },
    {
      id: 3,
      name: "Pentavalent Vaccine (DTP-HepB-Hib)",
      batchNumber: "PENT2024003",
      stock: 25,
      expiryDate: "2025-06-30",
      manufacturer: "Sanofi",
      status: "Expiring Soon"
    },
    {
      id: 4,
      name: "MMR Vaccine",
      batchNumber: "MMR2024004",
      stock: 0,
      expiryDate: "2025-10-20",
      manufacturer: "Merck",
      status: "Out of Stock"
    }
  ];

  const sampleMedicationInventory = [
    {
      id: 1,
      name: "Paracetamol 500mg tablet",
      batchNumber: "PARA2024001",
      stock: 500,
      expiryDate: "2026-03-15",
      manufacturer: "Unilab",
      status: "In Stock"
    },
    {
      id: 2,
      name: "Amoxicillin Trihydrate 500mg capsule",
      batchNumber: "AMOX2024002",
      stock: 120,
      expiryDate: "2025-07-20",
      manufacturer: "Pfizer",
      status: "Expiring Soon"
    },
    {
      id: 3,
      name: "Ibuprofen 400mg tablet",
      batchNumber: "IBU2024003",
      stock: 45,
      expiryDate: "2025-11-10",
      manufacturer: "Advil",
      status: "Low Stock"
    },
    {
      id: 4,
      name: "Cetirizine 10mg tablet",
      batchNumber: "CET2024004",
      stock: 0,
      expiryDate: "2025-09-05",
      manufacturer: "Zyrtec",
      status: "Out of Stock"
    },
    {
      id: 5,
      name: "Lagundi 600mg tablet",
      batchNumber: "LAG2024005",
      stock: 200,
      expiryDate: "2025-06-01",
      manufacturer: "Tawi-Tawi",
      status: "Expiring Soon"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Stock': return '#10b981';
      case 'Low Stock': return '#f59e0b';
      case 'Expiring Soon': return '#ef4444';
      case 'Out of Stock': return '#6b7280';
      default: return '#94a3b8';
    }
  };

  const [dateTimeConfig, setDateTimeConfig] = useState({
    date: simulatedDate ? simulatedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    time: simulatedDate ? 
      `${String(simulatedDate.getHours()).padStart(2, '0')}:${String(simulatedDate.getMinutes()).padStart(2, '0')}` : 
      `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`,
    useSimulation: isSimulated
  });

  // Update the dateTimeConfig when simulatedDate changes
  useEffect(() => {
    if (simulatedDate) {
      setDateTimeConfig({
        date: simulatedDate.toISOString().split('T')[0],
        time: `${String(simulatedDate.getHours()).padStart(2, '0')}:${String(simulatedDate.getMinutes()).padStart(2, '0')}`,
        useSimulation: true
      });
    }
  }, [simulatedDate]);

  // Handle saving the date and time configuration
  const handleSaveDateTimeConfig = () => {
    if (dateTimeConfig.useSimulation) {
      const [hours, minutes] = dateTimeConfig.time.split(':').map(Number);
      const simulatedDate = new Date(dateTimeConfig.date);
      simulatedDate.setHours(hours, minutes, 0, 0);
      setSimulationDate(simulatedDate);
    } else {
      setSimulationDate(null); // Disable simulation
    }
    setShowDateTimeModal(false);
  };

  // Handle input changes
  const handleDateTimeChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDateTimeConfig({
      ...dateTimeConfig,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle reset checkups data
  const resetCheckUps = async () => {
    setResetLoading(true);
    setResetSuccess(null);
    
    try {
      // Use the context function to reset checkups
      const response = await resetTodaysCheckUps();
      console.log('Reset checkups response:', response);
      
      setResetSuccess({
        status: 'success',
        message: 'Check-ups data has been successfully reset',
        details: `${response.checkUps.length} entries in the new list`
      });
      
      // Close the modal after 3 seconds
      setTimeout(() => setShowResetConfirmModal(false), 3000);
    } catch (error) {
      console.error('Error resetting checkups data:', error);
      setResetSuccess({
        status: 'error',
        message: 'Failed to reset check-ups data',
        details: error.message
      });
    } finally {      setResetLoading(false);
    }
  };

  // User Management Handlers
  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserFormData({
      ...userFormData,
      [name]: value
    });
  };
  const handleCreateUser = async () => {
    setUserLoading(true);
    setUserSuccess(null);

    try {
      // Auto-add "Dr." prefix for doctors
      const firstName = userFormData.role === 'doctor' && !userFormData.firstName.startsWith('Dr.') 
        ? `Dr. ${userFormData.firstName}` 
        : userFormData.firstName;

      const userData = {
        ...userFormData,
        firstName
      };

      const response = await axios.post('http://localhost:5000/api/users/admin-create', userData);
      
      setUserSuccess({
        status: 'success',
        message: 'User created successfully!',
        details: `${firstName} ${userFormData.lastName} has been created as ${userFormData.role}.`
      });

      // Reset form
      setUserFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'doctor'
      });

      // Close modal after 2 seconds
      setTimeout(() => {
        setShowUserModal(false);
        setUserSuccess(null); // Reset success state when closing
      }, 2000);
    } catch (error) {
      console.error('Error creating user:', error);
      let errorMessage = 'Failed to create user';
      let errorDetails = error.message;
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        errorDetails = error.response.data.details || '';
      }
      
      setUserSuccess({
        status: 'error',
        message: errorMessage,
        details: errorDetails
      });
    } finally {
      setUserLoading(false);
    }
  };

  const fetchUsersByRole = async (role = 'all') => {
    try {
      let url = 'http://localhost:5000/api/users/role/';
      if (role === 'all') {
        // Fetch all non-patient users (doctors and admins)
        const [doctorsResponse, adminsResponse] = await Promise.all([
          axios.get(`${url}doctor`),
          axios.get(`${url}admin`)
        ]);
        setUsersList([...doctorsResponse.data.users, ...adminsResponse.data.users]);
      } else {
        const response = await axios.get(`${url}${role}`);
        setUsersList(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsersList([]);
    }
  };
  const handleViewUsers = (role = 'all') => {
    setSelectedRole(role);
    setShowUserListModal(true);
    fetchUsersByRole(role);
  };
  // Handle editing user
  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email || '',
      password: '', // Don't pre-fill password for security
      role: user.role,
      position: user.position || ''
    });
    setShowEditUserModal(true);
    setShowUserListModal(false);
  };

  // Handle updating user
  const handleUpdateUser = async () => {
    setUserLoading(true);
    setUserSuccess(null);

    try {
      // Auto-add "Dr." prefix for doctors if not already present
      const firstName = userFormData.role === 'doctor' && !userFormData.firstName.startsWith('Dr.') 
        ? `Dr. ${userFormData.firstName}` 
        : userFormData.firstName;      const updateData = {
        firstName,
        lastName: userFormData.lastName,
        email: userFormData.email,
        role: userFormData.role,
        position: userFormData.position
      };

      // Only include password if it's provided
      if (userFormData.password.trim()) {
        updateData.password = userFormData.password;
      }

      const response = await axios.put(`http://localhost:5000/api/users/${editingUser.id}`, updateData);
      
      setUserSuccess({
        status: 'success',
        message: 'User updated successfully!',
        details: `${firstName} ${userFormData.lastName} has been updated.`
      });

      // Reset form and close modal after 2 seconds
      setTimeout(() => {
        setShowEditUserModal(false);
        setUserSuccess(null);
        setEditingUser(null);
        fetchUsersByRole(selectedRole); // Refresh the user list
      }, 2000);
    } catch (error) {
      console.error('Error updating user:', error);
      let errorMessage = 'Failed to update user';
      let errorDetails = error.message;
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        errorDetails = error.response.data.details || '';
      }
      
      setUserSuccess({
        status: 'error',
        message: errorMessage,
        details: errorDetails
      });
    } finally {
      setUserLoading(false);
    }
  };

  // Handle delete user confirmation
  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirmModal(true);
    setShowUserListModal(false);
  };

  // Handle confirming user deletion
  const confirmDeleteUser = async () => {
    setDeleteLoading(true);

    try {
      await axios.delete(`http://localhost:5000/api/users/${userToDelete.id}`);
      
      // Close delete modal and refresh user list
      setShowDeleteConfirmModal(false);
      setUserToDelete(null);
      fetchUsersByRole(selectedRole);
      
      // Show success message briefly
      alert(`${userToDelete.firstName} ${userToDelete.lastName} has been deleted successfully.`);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Reset success state when opening user creation modal
  const handleOpenUserModal = () => {
    setUserSuccess(null);
    setShowUserModal(true);
    setUserFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'doctor'
    });
  };
    
  return (
    <React.Fragment>
      <Container fluid className="py-4 fade-in">        <Accordion defaultActiveKey="0" className="dashboard-card settings-accordion">
        {/* User Management Section */}
        <Accordion.Item eventKey="0" className="settings-accordion-item">
          <Accordion.Header className="settings-accordion-header">
            <i className="bi bi-people-fill me-2"></i> User Management
          </Accordion.Header>          <Accordion.Body className="settings-accordion-body">
            <div className="d-grid gap-2">              <Button 
                variant="outline-primary" 
                className="text-start settings-btn"
                onClick={handleOpenUserModal}
              >
                <i className="bi bi-person-plus me-2"></i> Add User
              </Button>
              <Button 
                variant="outline-primary" 
                className="text-start settings-btn"
                onClick={() => handleViewUsers('all')}
              >
                <i className="bi bi-pencil-square me-2"></i> View/Edit User
              </Button>
              <Button 
                variant="outline-primary" 
                className="text-start settings-btn"
                onClick={() => handleViewUsers('doctor')}
              >
                <i className="bi bi-person-heart me-2"></i> View Doctors
              </Button>
              <Button 
                variant="outline-primary" 
                className="text-start settings-btn"
                onClick={() => handleViewUsers('admin')}
              >
                <i className="bi bi-shield-check me-2"></i> View Admins
              </Button>
            </div>
          </Accordion.Body></Accordion.Item>

        {/* Vaccine & Prescription Management Section */}
        <Accordion.Item eventKey="1" className="settings-accordion-item">
          <Accordion.Header className="settings-accordion-header">
            <i className="bi bi-capsule me-2"></i> Vaccine & Prescription Management
          </Accordion.Header>
          <Accordion.Body className="settings-accordion-body">            <h5 className="mb-3 settings-section-title">
              <i className="bi bi-shield-plus me-2"></i> Vaccine Management
            </h5>            <div className="d-grid gap-2 mb-4">
              <Button 
                variant="outline-success" 
                className="text-start settings-btn"
                onClick={() => setShowVaccineModal(true)}
              >
                <i className="bi bi-plus-circle me-2"></i> Add New Vaccine
              </Button>
              <Button 
                variant="outline-success" 
                className="text-start settings-btn"
                onClick={() => setShowVaccineInventoryModal(true)}
              >
                <i className="bi bi-list-ul me-2"></i> View Vaccine Inventory
              </Button>
            </div>
              <h5 className="mb-3 settings-section-title">
              <i className="bi bi-prescription2 me-2"></i> Prescription Management
            </h5>            <div className="d-grid gap-2">
              <Button 
                variant="outline-info" 
                className="text-start settings-btn"
                onClick={() => setShowMedicationModal(true)}
              >
                <i className="bi bi-plus-circle me-2"></i> Add New Medication
              </Button>              <Button 
                variant="outline-info" 
                className="text-start settings-btn"
                onClick={() => setShowTemplateModal(true)}
              >
                <i className="bi bi-clipboard-data me-2"></i> Prescription Templates
              </Button>
              <Button 
                variant="outline-info" 
                className="text-start settings-btn"
                onClick={() => setShowMedicationInventoryModal(true)}
              >
                <i className="bi bi-archive me-2"></i> Medication Inventory & Expiry Alerts
              </Button>
            </div>
          </Accordion.Body>
        </Accordion.Item>        {/* System Configuration Section */}
        <Accordion.Item eventKey="2" className="settings-accordion-item">
          <Accordion.Header className="settings-accordion-header">
            <i className="bi bi-gear-fill me-2"></i> System Configuration
          </Accordion.Header>
          <Accordion.Body className="settings-accordion-body">
            <h5 className="mb-3 settings-section-title"><i className="bi bi-hospital me-2"></i> Clinic & Information</h5>
            <div className="d-grid gap-2">
              <Button 
                variant="outline-primary" 
                className="text-start settings-btn"
                onClick={() => setShowDateTimeModal(true)}
              >
                <i className="bi bi-calendar-date me-2"></i> Date & Time
                {isSimulated && (
                  <span className="ms-2 badge bg-info">
                    <i className="bi bi-clock-history me-1"></i>
                    Simulated: {simulatedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
              </Button>
              <Button variant="outline-primary" className="text-start settings-btn">
                <i className="bi bi-database me-2"></i> Data Retention
              </Button>
              <Button 
                variant="outline-primary" 
                className="text-start settings-btn"
                onClick={() => setShowChartSimulationModal(true)}
              >
                <i className="bi bi-graph-up me-2"></i> Chart Simulation
              </Button>
              <Button 
                variant="outline-danger" 
                className="text-start settings-btn"
                onClick={() => setShowResetConfirmModal(true)}
              >
                <i className="bi bi-arrow-clockwise me-2"></i> Reset Check-Ups Data
              </Button>
            </div>
          </Accordion.Body>
        </Accordion.Item>

        {/* Access Control Section */}
        <Accordion.Item eventKey="3" className="settings-accordion-item">
          <Accordion.Header className="settings-accordion-header">
            <i className="bi bi-shield-fill me-2"></i> Access Control
          </Accordion.Header>
          <Accordion.Body className="settings-accordion-body">
            <h5 className="mb-3 settings-section-title"><i className="bi bi-person-badge me-2"></i> Role Management</h5>
            <div className="d-grid gap-2">
              <Button variant="outline-primary" className="text-start settings-btn">
                <i className="bi bi-lock-fill me-2"></i> Access Right
              </Button>
            </div>
          </Accordion.Body>
        </Accordion.Item>

        {/* Backup and Restore Section */}
        <Accordion.Item eventKey="4" className="settings-accordion-item">
          <Accordion.Header className="settings-accordion-header">
            <i className="bi bi-cloud-arrow-up-fill me-2"></i> Backup and Restore
          </Accordion.Header>
          <Accordion.Body className="settings-accordion-body">
            <div className="form-check form-switch">
              <input 
                className="form-check-input backup-switch" 
                type="checkbox" 
                id="backupSwitch" 
                style={{ transform: 'scale(1.5)' }}
              />
              <label className="form-check-label ms-3 fs-5 backup-label" htmlFor="backupSwitch">
                Enable Backup System
              </label>
            </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      </Container>

      {/* Date & Time Configuration Modal */}      <Modal 
        show={showDateTimeModal} 
        onHide={() => setShowDateTimeModal(false)}
        backdrop="static"
        centered
        className="date-time-modal dark-modal"
      >
        <Modal.Header closeButton className="border-0 pb-0 text-white" style={{ background: '#1e293b', borderBottom: '1px solid #334155' }}>
          <Modal.Title style={{ color: '#e5e7eb' }}>
            <i className="bi bi-calendar-date me-2"></i>
            Date & Time Configuration
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#1e293b', color: '#e5e7eb' }}>        <div className="mb-3 pb-3" style={{ borderBottom: '1px solid #334155' }}>
          <Form.Check 
            type="switch"
            id="simulation-switch"
            name="useSimulation"
            label="Enable Date & Time Simulation"
            checked={dateTimeConfig.useSimulation}
            onChange={handleDateTimeChange}
            className="fs-5"
            style={{ color: '#e5e7eb' }}
          />
          <div className="mt-2 fs-6" style={{ color: '#94a3b8' }}>
            {dateTimeConfig.useSimulation 
              ? "Simulation is active. All system features will use the date and time set below." 
              : "System will use your actual system date and time."}
          </div>
        </div>

        {dateTimeConfig.useSimulation && (          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label style={{ color: '#38bdf8' }}>Date</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={dateTimeConfig.date}
                  onChange={handleDateTimeChange}
                  className="date-input"
                  style={{ 
                    background: '#0f172a',
                    color: '#e5e7eb',
                    borderColor: '#334155',
                    padding: '10px'
                  }}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label style={{ color: '#38bdf8' }}>Time</Form.Label>
                <Form.Control
                  type="time"
                  name="time"
                  value={dateTimeConfig.time}
                  onChange={handleDateTimeChange}
                  className="time-input"
                  style={{ 
                    background: '#0f172a',
                    color: '#e5e7eb',
                    borderColor: '#334155',
                    padding: '10px'
                  }}
                />
              </Form.Group>
            </Col>
          </Row>
        )}

        {dateTimeConfig.useSimulation && (          <div className="d-flex align-items-center" style={{ 
            background: '#164e63', 
            border: '1px solid #155e75', 
            borderRadius: '6px', 
            padding: '12px 16px', 
            color: '#e0f2fe' 
          }}>
            <i className="bi bi-info-circle-fill me-2 fs-5"></i>
            <div>
              <strong>Simulation Mode:</strong> The simulated date and time will be displayed throughout the application. This affects all date-dependent features.
            </div>
          </div>
        )}
        </Modal.Body>        <Modal.Footer className="border-0" style={{ background: '#1e293b', borderTop: '1px solid #334155' }}>
        <Button 
          variant="secondary" 
          onClick={() => setShowDateTimeModal(false)}
          style={{ background: '#475569', borderColor: '#475569' }}
        >
          Cancel
        </Button>
        {dateTimeConfig.useSimulation && (
          <Button 
            variant="outline-info" 
            onClick={() => {
              const now = new Date();
              setDateTimeConfig({
                date: now.toISOString().split('T')[0],
                time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
                useSimulation: true
              });
            }}
            style={{ borderColor: '#38bdf8', color: '#38bdf8' }}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Reset to Current Date/Time
          </Button>
        )}
        <Button 
          variant="primary" 
          onClick={handleSaveDateTimeConfig}
          style={{ background: '#38bdf8', borderColor: '#38bdf8' }}
        >
          Save Configuration
        </Button>
      </Modal.Footer>
    </Modal>

    {/* Reset Check-Ups Confirmation Modal */}
    <Modal
      show={showResetConfirmModal}
      onHide={() => !resetLoading && setShowResetConfirmModal(false)}
      backdrop="static"
      centered
      className="date-time-modal"
    >
      <Modal.Header closeButton={!resetLoading} className="border-0 pb-0">
        <Modal.Title>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Reset Check-Ups Data
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {resetSuccess ? (
          <div className={`alert alert-${resetSuccess.status === 'success' ? 'success' : 'danger'} d-flex align-items-center`}>
            <i className={`bi me-2 fs-4 ${resetSuccess.status === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
            <div>
              <strong>{resetSuccess.message}</strong>
              <p className="mb-0 mt-1">{resetSuccess.details}</p>
            </div>
          </div>
        ) : (
          <>
            <p>Are you sure you want to reset the "Check-Ups Today" data?</p>
            <div className="alert alert-warning d-flex align-items-center">
              <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
              <div>
                <strong>Warning:</strong> This will clear all current check-ups data and reload appointments scheduled for today. This action cannot be undone.
              </div>
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer className="border-0">
        {!resetSuccess && (
          <>
            <Button 
              variant="secondary" 
              onClick={() => setShowResetConfirmModal(false)}
              disabled={resetLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={resetCheckUps}
              disabled={resetLoading}
            >
              {resetLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Resetting...
                </>
              ) : (
                'Reset Check-Ups'
              )}
            </Button>
          </>
        )}
        {resetSuccess && resetSuccess.status === 'success' && (
          <Button 
            variant="success" 
            onClick={() => setShowResetConfirmModal(false)}
          >
            Close
          </Button>
        )}
        {resetSuccess && resetSuccess.status === 'error' && (
          <>
            <Button 
              variant="secondary" 
              onClick={() => setShowResetConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={resetCheckUps}
            >
              Try Again
            </Button>
          </>        )}
      </Modal.Footer>
    </Modal>    {/* Add New Vaccine Modal */}
    {showVaccineModal && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1040,
      }}>
        <div style={{
          background: '#0f172a',
          color: '#e5e7eb',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '800px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
          zIndex: 1050,
        }}>
          <div style={{
            padding: '15px 20px',
            color: '#38bdf8',
            borderBottom: '1px solid #334155',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
              <i className="bi bi-shield-plus me-2"></i>
              Add New Vaccine
            </h4>
            {!vaccineLoading && (
              <button
                onClick={() => setShowVaccineModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#e5e7eb',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0',
                }}
              >
                ×
              </button>
            )}
          </div>
          <div style={{ padding: '20px', overflowY: 'auto', flexGrow: 1 }}>
        {vaccineSuccess ? (
          <div className={`alert alert-${vaccineSuccess.status === 'success' ? 'success' : 'danger'} d-flex align-items-center`}>
            <i className={`bi me-2 fs-4 ${vaccineSuccess.status === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
            <div>
              <strong>{vaccineSuccess.message}</strong>
              <p className="mb-0 mt-1">{vaccineSuccess.details}</p>
            </div>
          </div>
        ) : (          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Vaccine Name <span style={requiredStyle}>*</span></label>
                  <Form.Select
                    name="name"
                    value={vaccineFormData.name}
                    onChange={handleVaccineFormChange}
                    required
                    style={modalSelectStyle}
                  >
                    <option value="">Select a vaccine...</option>
                    {vaccineOptions.map((vaccine) => (
                      <option key={vaccine.id} value={vaccine.name}>
                        {vaccine.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Age Group</label>
                  <Form.Select
                    name="ageGroup"
                    value={vaccineFormData.ageGroup}
                    onChange={handleVaccineFormChange}
                    style={modalSelectStyle}
                  >
                    <option value="">Select age group...</option>
                    <option value="Newborn (0-1 month)">Newborn (0-1 month)</option>
                    <option value="Infant (1-12 months)">Infant (1-12 months)</option>
                    <option value="Toddler (1-3 years)">Toddler (1-3 years)</option>
                    <option value="Child (4-12 years)">Child (4-12 years)</option>
                    <option value="Adolescent (13-18 years)">Adolescent (13-18 years)</option>
                    <option value="Adult (18+ years)">Adult (18+ years)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Dosage</label>
                  <Form.Control
                    type="text"
                    name="dosage"
                    value={vaccineFormData.dosage}
                    onChange={handleVaccineFormChange}
                    placeholder="e.g., 0.5mL"
                    style={modalInputStyle}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Manufacturer</label>
                  <Form.Control
                    type="text"
                    name="manufacturer"
                    value={vaccineFormData.manufacturer}
                    onChange={handleVaccineFormChange}
                    placeholder="Enter manufacturer name"
                    style={modalInputStyle}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Batch Number</label>
                  <Form.Control
                    type="text"
                    name="batchNumber"
                    value={vaccineFormData.batchNumber}
                    onChange={handleVaccineFormChange}
                    placeholder="Enter batch number"
                    style={modalInputStyle}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Expiry Date</label>
                  <Form.Control
                    type="date"
                    name="expiryDate"
                    value={vaccineFormData.expiryDate}
                    onChange={handleVaccineFormChange}
                    style={modalInputStyle}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Stock Quantity</label>
                  <Form.Control
                    type="number"
                    name="stock"
                    value={vaccineFormData.stock}
                    onChange={handleVaccineFormChange}
                    min="0"
                    placeholder="0"
                    style={modalInputStyle}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <label style={modalLabelStyle}>Description</label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={vaccineFormData.description}
                onChange={handleVaccineFormChange}
                placeholder="Enter vaccine description or notes..."
                style={modalTextAreaStyle}
              />
            </Form.Group>
          </Form>)}
          </div>
          <div style={{
            padding: '15px 20px',
            borderTop: '1px solid #334155',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
          }}>
            {!vaccineSuccess && (
              <>
                <Button 
                  variant="secondary" 
                  onClick={() => setShowVaccineModal(false)}
                  disabled={vaccineLoading}
                >
                  Cancel
                </Button>
                <Button 
                  variant="success" 
                  onClick={handleAddVaccine}
                  disabled={vaccineLoading || !vaccineFormData.name}
                >
                  {vaccineLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Adding Vaccine...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus-circle me-1"></i>
                      Add Vaccine
                    </>
                  )}
                </Button>
              </>
            )}
            {vaccineSuccess && vaccineSuccess.status === 'success' && (
              <Button 
                variant="success" 
                onClick={() => setShowVaccineModal(false)}
              >
                <i className="bi bi-check-circle me-1"></i>
                Close
              </Button>
            )}
            {vaccineSuccess && vaccineSuccess.status === 'error' && (
              <>
                <Button 
                  variant="secondary" 
                  onClick={() => setShowVaccineModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="success" 
                  onClick={handleAddVaccine}
                >
                  Try Again
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    )}    {/* Add New Medication Modal */}
    {showMedicationModal && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1040,
      }}>
        <div style={{
          background: '#0f172a',
          color: '#e5e7eb',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '800px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
          zIndex: 1050,
        }}>
          <div style={{
            padding: '15px 20px',
            color: '#38bdf8',
            borderBottom: '1px solid #334155',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
              <i className="bi bi-capsule me-2"></i>
              Add New Medication
            </h4>
            {!medicationLoading && (
              <button
                onClick={() => setShowMedicationModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#e5e7eb',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0',
                }}
              >
                ×
              </button>
            )}
          </div>
          <div style={{ padding: '20px', overflowY: 'auto', flexGrow: 1 }}>
        {medicationSuccess ? (
          <div className={`alert alert-${medicationSuccess.status === 'success' ? 'success' : 'danger'} d-flex align-items-center`}>
            <i className={`bi me-2 fs-4 ${medicationSuccess.status === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
            <div>
              <strong>{medicationSuccess.message}</strong>
              <p className="mb-0 mt-1">{medicationSuccess.details}</p>
            </div>
          </div>
        ) : (          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Medication Name <span style={requiredStyle}>*</span></label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={medicationFormData.name}
                    onChange={handleMedicationFormChange}
                    placeholder="Enter medication name"
                    required
                    style={modalInputStyle}
                  />
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                    Or select from existing: 
                    <Form.Select
                      className="mt-1"
                      onChange={(e) => setMedicationFormData({...medicationFormData, name: e.target.value})}
                      value=""
                      style={{...modalSelectStyle, fontSize: '12px'}}
                    >
                      <option value="">Choose from existing...</option>
                      {medicationOptions.map((med, index) => (
                        <option key={index} value={med}>{med}</option>
                      ))}
                    </Form.Select>
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Medication Type</label>
                  <Form.Select
                    name="type"
                    value={medicationFormData.type}
                    onChange={handleMedicationFormChange}
                    style={modalSelectStyle}
                  >
                    <option value="">Select type...</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Drops">Drops</option>
                    <option value="Injection">Injection</option>
                    <option value="Suspension">Suspension</option>
                    <option value="Ointment">Ointment</option>
                    <option value="Inhaler">Inhaler</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Strength</label>
                  <Form.Control
                    type="text"
                    name="strength"
                    value={medicationFormData.strength}
                    onChange={handleMedicationFormChange}
                    placeholder="e.g., 500mg, 5mg/5mL"
                    style={modalInputStyle}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Form</label>
                  <Form.Control
                    type="text"
                    name="form"
                    value={medicationFormData.form}
                    onChange={handleMedicationFormChange}
                    placeholder="e.g., tablet, capsule"
                    style={modalInputStyle}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Manufacturer</label>
                  <Form.Control
                    type="text"
                    name="manufacturer"
                    value={medicationFormData.manufacturer}
                    onChange={handleMedicationFormChange}
                    placeholder="Enter manufacturer"
                    style={modalInputStyle}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Batch Number</label>
                  <Form.Control
                    type="text"
                    name="batchNumber"
                    value={medicationFormData.batchNumber}
                    onChange={handleMedicationFormChange}
                    placeholder="Enter batch number"
                    style={modalInputStyle}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Expiry Date</label>
                  <Form.Control
                    type="date"
                    name="expiryDate"
                    value={medicationFormData.expiryDate}
                    onChange={handleMedicationFormChange}
                    style={modalInputStyle}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Stock Quantity</label>
                  <Form.Control
                    type="number"
                    name="stock"
                    value={medicationFormData.stock}
                    onChange={handleMedicationFormChange}
                    min="0"
                    placeholder="0"
                    style={modalInputStyle}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <label style={modalLabelStyle}>Description</label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={medicationFormData.description}
                onChange={handleMedicationFormChange}
                placeholder="Enter medication description, usage instructions, or notes..."
                style={modalTextAreaStyle}
              />
            </Form.Group>
          </Form>
        )}
          </div>
          <div style={{
            padding: '15px 20px',
            borderTop: '1px solid #334155',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
          }}>
            {!medicationSuccess && (
              <>
                <Button 
                  variant="secondary" 
                  onClick={() => setShowMedicationModal(false)}
                  disabled={medicationLoading}
                >
                  Cancel
                </Button>
                <Button 
                  variant="info" 
                  onClick={handleAddMedication}
                  disabled={medicationLoading || !medicationFormData.name}
                >
                  {medicationLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Adding Medication...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus-circle me-1"></i>
                      Add Medication
                    </>
                  )}
                </Button>
              </>
            )}
            {medicationSuccess && medicationSuccess.status === 'success' && (
              <Button 
                variant="info" 
                onClick={() => setShowMedicationModal(false)}
              >
                <i className="bi bi-check-circle me-1"></i>
                Close
              </Button>
            )}
            {medicationSuccess && medicationSuccess.status === 'error' && (
              <>
                <Button 
                  variant="secondary" 
                  onClick={() => setShowMedicationModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="info" 
                  onClick={handleAddMedication}
                >
                  Try Again
                </Button>
              </>
            )}
          </div>        </div>
      </div>
    )}

    {/* Prescription Template Modal */}
    {showTemplateModal && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1040,
      }}>        <div style={{
          background: '#0f172a',
          color: '#e5e7eb',
          borderRadius: '8px',
          width: '95%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
          zIndex: 1050,
        }}>
          <div style={{
            padding: '15px 20px',
            color: '#38bdf8',
            borderBottom: '1px solid #334155',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
              <i className="bi bi-clipboard-data me-2"></i>
              Prescription Templates
            </h4>
            {!templateLoading && (
              <button
                onClick={() => setShowTemplateModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#e5e7eb',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0',
                }}
              >
                ×
              </button>
            )}
          </div>
          <div style={{ padding: '20px', overflowY: 'auto', flexGrow: 1 }}>
            <Row>
              {/* Create New Template Section */}
              <Col md={6}>
                <h5 style={{ color: '#38bdf8', marginBottom: '15px' }}>
                  <i className="bi bi-plus-circle me-2"></i>
                  Create New Template
                </h5>
                {templateSuccess && (
                  <div className="alert alert-success d-flex align-items-center mb-3">
                    <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                    <div>{templateSuccess}</div>
                  </div>
                )}
                <Form onSubmit={handleTemplateSubmit}>
                  <Form.Group className="mb-3">
                    <label style={modalLabelStyle}>Template Name <span style={requiredStyle}>*</span></label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={templateFormData.name}
                      onChange={handleTemplateChange}
                      placeholder="Enter template name"
                      required
                      style={modalInputStyle}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <label style={modalLabelStyle}>Category</label>
                    <Form.Select
                      name="category"
                      value={templateFormData.category}
                      onChange={handleTemplateChange}
                      style={modalSelectStyle}
                    >
                      <option value="">Select category...</option>
                      {templateCategories.map((category, index) => (
                        <option key={index} value={category}>{category}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <label style={modalLabelStyle}>Description</label>
                    <Form.Control
                      type="text"
                      name="description"
                      value={templateFormData.description}
                      onChange={handleTemplateChange}
                      placeholder="Brief description of the template"
                      style={modalInputStyle}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <label style={modalLabelStyle}>Medications <span style={requiredStyle}>*</span></label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="medications"
                      value={templateFormData.medications}
                      onChange={handleTemplateChange}
                      placeholder="Enter medications (one per line)&#10;Example:&#10;Paracetamol 500mg - Take 1-2 tablets every 6 hours&#10;Ibuprofen 400mg - Take 1 tablet every 8 hours with food"
                      required
                      style={modalTextAreaStyle}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <label style={modalLabelStyle}>Instructions</label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="instructions"
                      value={templateFormData.instructions}
                      onChange={handleTemplateChange}
                      placeholder="General instructions for the patient"
                      style={modalTextAreaStyle}
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <label style={modalLabelStyle}>Duration</label>
                        <Form.Control
                          type="text"
                          name="duration"
                          value={templateFormData.duration}
                          onChange={handleTemplateChange}
                          placeholder="e.g., 5-7 days, 2 weeks"
                          style={modalInputStyle}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <label style={modalLabelStyle}>Notes</label>
                        <Form.Control
                          type="text"
                          name="notes"
                          value={templateFormData.notes}
                          onChange={handleTemplateChange}
                          placeholder="Additional notes or warnings"
                          style={modalInputStyle}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Button
                    type="submit"
                    variant="success"
                    disabled={templateLoading || !templateFormData.name || !templateFormData.medications}
                    className="w-100"
                  >
                    {templateLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving Template...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-save me-1"></i>
                        Save Template
                      </>
                    )}
                  </Button>
                </Form>
              </Col>

              {/* Templates Library Section */}
              <Col md={6}>
                <h5 style={{ color: '#38bdf8', marginBottom: '15px' }}>
                  <i className="bi bi-collection me-2"></i>
                  Template Library
                </h5>
                
                {/* Pre-built Templates */}
                <div className="mb-4">
                  <h6 style={{ color: '#f59e0b', marginBottom: '10px' }}>
                    <i className="bi bi-star-fill me-1"></i>
                    Pre-built Templates
                  </h6>
                  {preBuiltTemplates.map((template) => (
                    <div
                      key={template.id}
                      style={{
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        padding: '12px',
                        marginBottom: '10px'
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div style={{ flex: 1 }}>
                          <h6 style={{ color: '#38bdf8', margin: '0 0 4px 0' }}>
                            {template.name}
                          </h6>
                          <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 8px 0' }}>
                            {template.description}
                          </p>
                          <span style={{
                            background: '#0f172a',
                            color: '#fbbf24',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11px'
                          }}>
                            {template.category}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline-success"
                          onClick={() => loadTemplate(template)}
                          style={{ marginLeft: '10px' }}
                        >
                          <i className="bi bi-download me-1"></i>
                          Use
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Saved Templates */}
                <div>
                  <h6 style={{ color: '#10b981', marginBottom: '10px' }}>
                    <i className="bi bi-bookmark-fill me-1"></i>
                    Your Saved Templates ({savedTemplates.length})
                  </h6>
                  {savedTemplates.length === 0 ? (
                    <div style={{
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '20px',
                      textAlign: 'center',
                      color: '#9ca3af'
                    }}>
                      <i className="bi bi-clipboard-x fs-2 d-block mb-2"></i>
                      No saved templates yet. Create your first template!
                    </div>
                  ) : (
                    savedTemplates.map((template) => (
                      <div
                        key={template.id}
                        style={{
                          background: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '6px',
                          padding: '12px',
                          marginBottom: '10px'
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div style={{ flex: 1 }}>
                            <h6 style={{ color: '#38bdf8', margin: '0 0 4px 0' }}>
                              {template.name}
                            </h6>
                            <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 8px 0' }}>
                              {template.description}
                            </p>
                            {template.category && (
                              <span style={{
                                background: '#0f172a',
                                color: '#10b981',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '11px'
                              }}>
                                {template.category}
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '5px', marginLeft: '10px' }}>
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() => loadTemplate(template)}
                            >
                              <i className="bi bi-download"></i>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => deleteTemplate(template.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </div>
                        </div>
                      </div>                    ))
                  )}
                </div>
              </Col>
            </Row>
          </div>
          <div style={{
            padding: '15px 20px',
            borderTop: '1px solid #334155',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
          }}>
            <Button 
              variant="secondary" 
              onClick={() => setShowTemplateModal(false)}
              disabled={templateLoading}
            >
              Close
            </Button>
          </div>        </div>
      </div>
    )}

    {/* Vaccine Inventory Modal */}
    {showVaccineInventoryModal && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1040,
      }}>
        <div style={{
          background: '#0f172a',
          color: '#e5e7eb',
          borderRadius: '8px',
          width: '95%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
          zIndex: 1050,
        }}>
          <div style={{
            padding: '15px 20px',
            color: '#38bdf8',
            borderBottom: '1px solid #334155',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
              <i className="bi bi-shield-plus me-2"></i>
              Vaccine Inventory
            </h4>            <button
              onClick={() => setShowVaccineInventoryModal(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#e5e7eb',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0',
              }}
            >
              ×
            </button>
          </div>
          <div style={{ padding: '20px', overflowY: 'auto', flexGrow: 1 }}>
            <div style={{ marginBottom: '20px' }}>              <h6 style={{ color: '#10b981', marginBottom: '10px' }}>
                <i className="bi bi-list-check me-1"></i>
                Current Vaccine Stock ({vaccineInventory.length} items)
              </h6>
              <div style={{ display: 'grid', gap: '10px' }}>
                {vaccineInventory.map((vaccine) => (
                  <div
                    key={vaccine.id}
                    style={{
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '15px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <h6 style={{ color: '#38bdf8', margin: '0 0 8px 0', fontSize: '16px' }}>
                          {vaccine.name}
                        </h6>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px', fontSize: '14px' }}>
                          <div><span style={{ color: '#94a3b8' }}>Batch:</span> {vaccine.batchNumber}</div>
                          <div><span style={{ color: '#94a3b8' }}>Stock:</span> {vaccine.stock} units</div>
                          <div><span style={{ color: '#94a3b8' }}>Expiry:</span> {vaccine.expiryDate}</div>
                          <div><span style={{ color: '#94a3b8' }}>Manufacturer:</span> {vaccine.manufacturer}</div>
                        </div>
                      </div>
                      <span style={{
                        background: getStatusColor(vaccine.status),
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginLeft: '15px'
                      }}>
                        {vaccine.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{
            padding: '15px 20px',
            borderTop: '1px solid #334155',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
          }}>
            <Button 
              variant="secondary" 
              onClick={() => setShowVaccineInventoryModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    )}

    {/* Medication Inventory Modal */}
    {showMedicationInventoryModal && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1040,
      }}>
        <div style={{
          background: '#0f172a',
          color: '#e5e7eb',
          borderRadius: '8px',
          width: '95%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
          zIndex: 1050,
        }}>
          <div style={{
            padding: '15px 20px',
            color: '#38bdf8',
            borderBottom: '1px solid #334155',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
              <i className="bi bi-capsule me-2"></i>
              Medication Inventory & Expiry Alerts
            </h4>
            <button
              onClick={() => setShowMedicationInventoryModal(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#e5e7eb',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0',
              }}
            >
              ×
            </button>
          </div>
          <div style={{ padding: '20px', overflowY: 'auto', flexGrow: 1 }}>
            {/* Expiry Alerts Section */}
            <div style={{ marginBottom: '30px' }}>              <h6 style={{ color: '#ef4444', marginBottom: '10px' }}>
                <i className="bi bi-exclamation-triangle-fill me-1"></i>
                Expiry Alerts ({medicationInventory.filter(med => med.status === 'Expiring Soon' || med.status === 'Out of Stock').length} items need attention)
              </h6>
              <div style={{ display: 'grid', gap: '8px' }}>
                {medicationInventory
                  .filter(med => med.status === 'Expiring Soon' || med.status === 'Out of Stock')
                  .map((medication) => (
                    <div
                      key={medication.id}
                      style={{
                        background: '#7f1d1d',
                        border: '1px solid #dc2626',
                        borderRadius: '6px',
                        padding: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ color: '#fca5a5', fontWeight: 'bold' }}>{medication.name}</span>
                          <div style={{ fontSize: '12px', color: '#fca5a5', marginTop: '4px' }}>
                            Batch: {medication.batchNumber} | Expiry: {medication.expiryDate} | Stock: {medication.stock}
                          </div>
                        </div>
                        <span style={{
                          background: '#dc2626',
                          color: '#fff',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '11px'
                        }}>
                          {medication.status}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>            {/* Full Inventory Section */}
            <div>
              <h6 style={{ color: '#10b981', marginBottom: '10px' }}>
                <i className="bi bi-list-check me-1"></i>
                Complete Medication Inventory ({medicationInventory.length} items)
              </h6>
              <div style={{ display: 'grid', gap: '10px' }}>
                {medicationInventory.map((medication) => (
                  <div
                    key={medication.id}
                    style={{
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '15px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <h6 style={{ color: '#38bdf8', margin: '0 0 8px 0', fontSize: '16px' }}>
                          {medication.name}
                        </h6>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px', fontSize: '14px' }}>
                          <div><span style={{ color: '#94a3b8' }}>Batch:</span> {medication.batchNumber}</div>
                          <div><span style={{ color: '#94a3b8' }}>Stock:</span> {medication.stock} units</div>
                          <div><span style={{ color: '#94a3b8' }}>Expiry:</span> {medication.expiryDate}</div>
                          <div><span style={{ color: '#94a3b8' }}>Manufacturer:</span> {medication.manufacturer}</div>
                        </div>
                      </div>
                      <span style={{
                        background: getStatusColor(medication.status),
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginLeft: '15px'
                      }}>
                        {medication.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{
            padding: '15px 20px',
            borderTop: '1px solid #334155',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
          }}>
            <Button 
              variant="secondary" 
              onClick={() => setShowMedicationInventoryModal(false)}
            >
              Close
            </Button>
          </div>        </div>
      </div>
    )}

    {/* User Creation Modal */}
    {showUserModal && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1040,
      }}>
        <div style={{
          background: '#0f172a',
          color: '#e5e7eb',
          borderRadius: '8px',
          width: '95%',
          maxWidth: '600px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
          zIndex: 1050,
        }}>
          <div style={{
            padding: '15px 20px',
            color: '#38bdf8',
            borderBottom: '1px solid #334155',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
              <i className="bi bi-person-plus me-2"></i>
              Create New User
            </h4>
            {!userLoading && (
              <button
                onClick={() => setShowUserModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#e5e7eb',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0',
                }}
              >
                ×
              </button>
            )}
          </div>
          <div style={{ padding: '20px', overflowY: 'auto', flexGrow: 1 }}>
            {userSuccess ? (
              <div className={`alert alert-${userSuccess.status === 'success' ? 'success' : 'danger'} d-flex align-items-center`}>
                <i className={`bi me-2 fs-4 ${userSuccess.status === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
                <div>
                  <strong>{userSuccess.message}</strong>
                  <p className="mb-0 mt-1">{userSuccess.details}</p>
                </div>
              </div>
            ) : (
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <label style={modalLabelStyle}>First Name <span style={requiredStyle}>*</span></label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={userFormData.firstName}
                        onChange={handleUserFormChange}
                        placeholder="Enter first name"
                        required
                        style={modalInputStyle}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <label style={modalLabelStyle}>Last Name <span style={requiredStyle}>*</span></label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={userFormData.lastName}
                        onChange={handleUserFormChange}
                        placeholder="Enter last name"
                        required
                        style={modalInputStyle}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Email <span style={requiredStyle}>*</span></label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={userFormData.email}
                    onChange={handleUserFormChange}
                    placeholder="Enter email address"
                    required
                    style={modalInputStyle}
                  />
                </Form.Group>                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Password <span style={requiredStyle}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={userFormData.password}
                      onChange={handleUserFormChange}
                      placeholder="Enter password"
                      required
                      style={{...modalInputStyle, paddingRight: '40px'}}
                    />
                    <Button
                      variant="link"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        border: 'none',
                        background: 'none',
                        color: '#9ca3af',
                        padding: '0',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </Button>
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Role <span style={requiredStyle}>*</span></label>
                  <Form.Select
                    name="role"
                    value={userFormData.role}
                    onChange={handleUserFormChange}
                    style={modalSelectStyle}
                  >
                    <option value="doctor">Doctor</option>
                    <option value="admin">Admin</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Position <span style={requiredStyle}>*</span></label>
                  <Form.Select
                    name="position"
                    value={userFormData.position}
                    onChange={handleUserFormChange}
                    style={modalSelectStyle}
                  >
                    <option value="">Select Position</option>
                    <option value="officer">Officer</option>
                    <option value="nutritionist">Nutritionist</option>
                    <option value="nurse">Nurse</option>
                    <option value="aide">Aide</option>
                  </Form.Select>
                </Form.Group>
              </Form>
            )}
          </div>
          <div style={{
            padding: '15px 20px',
            borderTop: '1px solid #334155',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
          }}>
            {!userSuccess && (
              <>
                <Button 
                  variant="secondary" 
                  onClick={() => setShowUserModal(false)}
                  disabled={userLoading}
                >
                  Cancel
                </Button>                <Button 
                  variant="primary" 
                  onClick={handleCreateUser}
                  disabled={userLoading || !userFormData.firstName || !userFormData.lastName || !userFormData.email || !userFormData.password || !userFormData.position}
                >
                  {userLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating User...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-plus me-1"></i>
                      Create User
                    </>
                  )}
                </Button>
              </>
            )}
            {userSuccess && userSuccess.status === 'success' && (
              <Button 
                variant="success" 
                onClick={() => setShowUserModal(false)}
              >
                <i className="bi bi-check-circle me-1"></i>
                Close
              </Button>
            )}
            {userSuccess && userSuccess.status === 'error' && (
              <>
                <Button 
                  variant="secondary" 
                  onClick={() => setShowUserModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleCreateUser}
                >
                  Try Again
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    )}

    {/* User List Modal */}
    {showUserListModal && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1040,
      }}>
        <div style={{
          background: '#0f172a',
          color: '#e5e7eb',
          borderRadius: '8px',
          width: '95%',
          maxWidth: '800px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
          zIndex: 1050,
        }}>
          <div style={{
            padding: '15px 20px',
            color: '#38bdf8',
            borderBottom: '1px solid #334155',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
              <i className="bi bi-people me-2"></i>
              {selectedRole === 'all' ? 'All Users' : 
               selectedRole === 'doctor' ? 'Doctors' : 
               selectedRole === 'admin' ? 'Admins' : 'Users'}
            </h4>
            <button
              onClick={() => setShowUserListModal(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#e5e7eb',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0',
              }}
            >
              ×
            </button>
          </div>
          <div style={{ padding: '20px', overflowY: 'auto', flexGrow: 1 }}>
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <label style={modalLabelStyle}>Filter by Role:</label>
              <Form.Select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  fetchUsersByRole(e.target.value);
                }}
                style={{...modalSelectStyle, width: 'auto', minWidth: '150px'}}
              >
                <option value="all">All Users</option>
                <option value="doctor">Doctors</option>
                <option value="admin">Admins</option>
              </Form.Select>
            </div>

            {usersList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                <i className="bi bi-people" style={{ fontSize: '3rem', marginBottom: '15px', display: 'block' }}></i>
                <h6>No users found</h6>
                <p>There are no {selectedRole === 'all' ? 'users' : selectedRole + 's'} to display.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {usersList.map((user) => (
                  <div
                    key={user.id}
                    style={{
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      padding: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h6 style={{ color: '#38bdf8', margin: '0 0 4px 0' }}>
                        {user.firstName} {user.lastName}
                      </h6>
                      <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 4px 0' }}>
                        {user.email}
                      </p>
                      <span style={{
                        background: user.role === 'admin' ? '#dc2626' : '#059669',
                        color: '#fff',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {user.role.toUpperCase()}
                      </span>
                    </div>                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button
                        size="sm"
                        variant="outline-info"
                        title="View Details"
                        onClick={() => alert(`User Details:\nName: ${user.firstName} ${user.lastName}\nEmail: ${user.email}\nRole: ${user.role.toUpperCase()}\nCreated: ${new Date(user.createdAt).toLocaleDateString()}`)}
                      >
                        <i className="bi bi-eye"></i>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-warning"
                        title="Edit User"
                        onClick={() => handleEditUser(user)}
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        title="Delete User"
                        onClick={() => handleDeleteUser(user)}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{
            padding: '15px 20px',
            borderTop: '1px solid #334155',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ color: '#9ca3af', fontSize: '14px' }}>
              Showing {usersList.length} {selectedRole === 'all' ? 'users' : selectedRole + 's'}
            </div>
            <Button 
              variant="secondary" 
              onClick={() => setShowUserListModal(false)}
            >
              Close
            </Button>
          </div>        </div>
      </div>
    )}

    {/* Edit User Modal */}
    {showEditUserModal && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1040,
      }}>
        <div style={{
          background: '#0f172a',
          color: '#e5e7eb',
          borderRadius: '8px',
          width: '95%',
          maxWidth: '600px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
          zIndex: 1050,
        }}>
          <div style={{
            padding: '15px 20px',
            color: '#38bdf8',
            borderBottom: '1px solid #334155',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
              <i className="bi bi-pencil-square me-2"></i>
              Edit User
            </h4>
            {!userLoading && (
              <button
                onClick={() => setShowEditUserModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#e5e7eb',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0',
                }}
              >
                ×
              </button>
            )}
          </div>
          <div style={{ padding: '20px', overflowY: 'auto', flexGrow: 1 }}>
            {userSuccess ? (
              <div className={`alert alert-${userSuccess.status === 'success' ? 'success' : 'danger'} d-flex align-items-center`}>
                <i className={`bi me-2 fs-4 ${userSuccess.status === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
                <div>
                  <strong>{userSuccess.message}</strong>
                  <p className="mb-0 mt-1">{userSuccess.details}</p>
                </div>
              </div>
            ) : (
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <label style={modalLabelStyle}>First Name <span style={requiredStyle}>*</span></label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={userFormData.firstName}
                        onChange={handleUserFormChange}
                        placeholder="Enter first name"
                        required
                        style={modalInputStyle}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <label style={modalLabelStyle}>Last Name <span style={requiredStyle}>*</span></label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={userFormData.lastName}
                        onChange={handleUserFormChange}
                        placeholder="Enter last name"
                        required
                        style={modalInputStyle}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Email <span style={requiredStyle}>*</span></label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={userFormData.email}
                    onChange={handleUserFormChange}
                    placeholder="Enter email address"
                    required
                    style={modalInputStyle}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={userFormData.password}
                      onChange={handleUserFormChange}
                      placeholder="Leave blank to keep current password"
                      style={{...modalInputStyle, paddingRight: '40px'}}
                    />
                    <Button
                      variant="link"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        border: 'none',
                        background: 'none',
                        color: '#9ca3af',
                        padding: '0',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </Button>
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                    Leave blank to keep the current password
                  </div>
                </Form.Group>                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Role <span style={requiredStyle}>*</span></label>
                  <Form.Select
                    name="role"
                    value={userFormData.role}
                    onChange={handleUserFormChange}
                    style={modalSelectStyle}
                  >
                    <option value="doctor">Doctor</option>
                    <option value="admin">Admin</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Position <span style={requiredStyle}>*</span></label>
                  <Form.Select
                    name="position"
                    value={userFormData.position}
                    onChange={handleUserFormChange}
                    style={modalSelectStyle}
                  >
                    <option value="">Select Position</option>
                    <option value="officer">Officer</option>
                    <option value="nutritionist">Nutritionist</option>
                    <option value="nurse">Nurse</option>
                    <option value="aide">Aide</option>
                  </Form.Select>
                </Form.Group>
              </Form>
            )}
          </div>
          <div style={{
            padding: '15px 20px',
            borderTop: '1px solid #334155',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
          }}>
            {!userSuccess && (
              <>
                <Button 
                  variant="secondary" 
                  onClick={() => setShowEditUserModal(false)}
                  disabled={userLoading}
                >
                  Cancel
                </Button>
                <Button 
                  variant="warning" 
                  onClick={handleUpdateUser}
                  disabled={userLoading || !userFormData.firstName || !userFormData.lastName || !userFormData.email || !userFormData.position}
                >
                  {userLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Updating User...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-1"></i>
                      Update User
                    </>
                  )}
                </Button>
              </>
            )}
            {userSuccess && userSuccess.status === 'success' && (
              <Button 
                variant="success" 
                onClick={() => setShowEditUserModal(false)}
              >
                <i className="bi bi-check-circle me-1"></i>
                Close
              </Button>
            )}
            {userSuccess && userSuccess.status === 'error' && (
              <>
                <Button 
                  variant="secondary" 
                  onClick={() => setShowEditUserModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="warning" 
                  onClick={handleUpdateUser}
                >
                  Try Again
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    )}

    {/* Delete User Confirmation Modal */}
    {showDeleteConfirmModal && userToDelete && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1040,
      }}>
        <div style={{
          background: '#0f172a',
          color: '#e5e7eb',
          borderRadius: '8px',
          width: '95%',
          maxWidth: '500px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
          zIndex: 1050,
        }}>
          <div style={{
            padding: '15px 20px',
            color: '#ef4444',
            borderBottom: '1px solid #334155',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
              <i className="bi bi-exclamation-triangle me-2"></i>
              Confirm Delete User
            </h4>
            {!deleteLoading && (
              <button
                onClick={() => setShowDeleteConfirmModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#e5e7eb',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0',
                }}
              >
                ×
              </button>
            )}
          </div>
          <div style={{ padding: '20px', overflowY: 'auto', flexGrow: 1 }}>
            <div className="alert alert-danger d-flex align-items-center">
              <i className="bi bi-exclamation-triangle-fill me-2 fs-4"></i>
              <div>
                <strong>Warning!</strong> This action cannot be undone.
              </div>
            </div>
            
            <p style={{ marginBottom: '15px' }}>
              Are you sure you want to delete the following user?
            </p>
            
            <div style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '15px'
            }}>
              <h6 style={{ color: '#38bdf8', margin: '0 0 8px 0' }}>
                {userToDelete.firstName} {userToDelete.lastName}
              </h6>
              <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 8px 0' }}>
                Email: {userToDelete.email}
              </p>
              <span style={{
                background: userToDelete.role === 'admin' ? '#dc2626' : '#059669',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {userToDelete.role.toUpperCase()}
              </span>
            </div>
            
            <p style={{ color: '#9ca3baf', fontSize: '14px' }}>
              This will permanently remove the user from the system. All associated data will be lost.
            </p>
          </div>
          <div style={{
            padding: '15px 20px',
            borderTop: '1px solid #334155',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
          }}>
            <Button 
              variant="secondary" 
              onClick={() => setShowDeleteConfirmModal(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={confirmDeleteUser}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Deleting...
                </>
              ) : (
                <>
                  <i className="bi bi-trash me-1"></i>
                  Delete User
                </>
              )}
            </Button>          </div>
        </div>
      </div>
    )}

    {/* Chart Simulation Modal */}
    <ChartSimulationModal 
      show={showChartSimulationModal} 
      onHide={() => setShowChartSimulationModal(false)} 
    />
    </React.Fragment>
  );
};

export default Asettings;