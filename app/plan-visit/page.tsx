"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { format } from "date-fns"
import {
  CalendarIcon,
  MapPin,
  Star,
  Filter,
  Clock,
  DollarSign,
  Search,
  CheckCircle,
  X,
  Heart,
  Share2,
} from "lucide-react"
import { MainNav } from "@/components/main-nav"

// Sample data for neurologists
const neurologists = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Movement Disorders Specialist",
    hospital: "City Neurological Center",
    address: "123 Medical Plaza, New York, NY",
    distance: 2.3,
    rating: 4.8,
    reviews: 124,
    price: 250,
    insurance: ["Medicare", "Blue Cross", "Aetna", "UnitedHealthcare"],
    availability: ["Monday", "Wednesday", "Friday"],
    nextAvailable: "Mar 18, 2025",
    image: "/placeholder.svg?height=150&width=150",
    bio: "Dr. Johnson is a board-certified neurologist specializing in movement disorders with over 15 years of experience treating Parkinson's disease. She completed her fellowship at Johns Hopkins University.",
    languages: ["English", "Spanish"],
    telehealth: true,
    newPatients: true,
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Neurologist, Parkinson's Specialist",
    hospital: "University Medical Center",
    address: "456 Health Avenue, New York, NY",
    distance: 3.7,
    rating: 4.6,
    reviews: 98,
    price: 275,
    insurance: ["Medicare", "Cigna", "Aetna"],
    availability: ["Tuesday", "Thursday"],
    nextAvailable: "Mar 15, 2025",
    image: "/placeholder.svg?height=150&width=150",
    bio: "Dr. Chen is a neurologist with specialized training in Parkinson's disease and other movement disorders. His research focuses on innovative treatments for neurodegenerative diseases.",
    languages: ["English", "Mandarin"],
    telehealth: true,
    newPatients: true,
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    specialty: "Neurologist",
    hospital: "Metropolitan Neurology Associates",
    address: "789 Wellness Blvd, New York, NY",
    distance: 1.5,
    rating: 4.9,
    reviews: 156,
    price: 300,
    insurance: ["Blue Cross", "UnitedHealthcare", "Cigna"],
    availability: ["Monday", "Tuesday", "Thursday", "Friday"],
    nextAvailable: "Mar 14, 2025",
    image: "/placeholder.svg?height=150&width=150",
    bio: "Dr. Rodriguez specializes in neurological disorders with a particular focus on Parkinson's disease. She is known for her patient-centered approach and comprehensive treatment plans.",
    languages: ["English", "Spanish", "Portuguese"],
    telehealth: true,
    newPatients: false,
  },
  {
    id: 4,
    name: "Dr. James Wilson",
    specialty: "Movement Disorders Neurologist",
    hospital: "Parkside Medical Group",
    address: "321 Neurology Lane, New York, NY",
    distance: 4.2,
    rating: 4.5,
    reviews: 87,
    price: 225,
    insurance: ["Medicare", "Blue Cross", "Aetna"],
    availability: ["Wednesday", "Friday"],
    nextAvailable: "Mar 22, 2025",
    image: "/placeholder.svg?height=150&width=150",
    bio: "Dr. Wilson has dedicated his career to treating patients with movement disorders. He combines traditional approaches with the latest research-backed treatments.",
    languages: ["English"],
    telehealth: false,
    newPatients: true,
  },
  {
    id: 5,
    name: "Dr. Lisa Thompson",
    specialty: "Neurologist, Movement Disorders",
    hospital: "Central Neurology Institute",
    address: "555 Medical Center Drive, New York, NY",
    distance: 3.1,
    rating: 4.7,
    reviews: 112,
    price: 280,
    insurance: ["Medicare", "Cigna", "UnitedHealthcare"],
    availability: ["Monday", "Thursday"],
    nextAvailable: "Mar 20, 2025",
    image: "/placeholder.svg?height=150&width=150",
    bio: "Dr. Thompson is a leading expert in movement disorders with a special interest in Parkinson's disease. She is actively involved in clinical research and patient advocacy.",
    languages: ["English", "French"],
    telehealth: true,
    newPatients: true,
  },
]

export default function PlanVisitPage() {
  const [filteredDoctors, setFilteredDoctors] = useState(neurologists)
  const [searchTerm, setSearchTerm] = useState("")
  const [priceRange, setPriceRange] = useState([200, 350])
  const [minRating, setMinRating] = useState(4)
  const [selectedInsurance, setSelectedInsurance] = useState<string[]>([])
  const [showTelehealth, setShowTelehealth] = useState(false)
  const [newPatientsOnly, setNewPatientsOnly] = useState(false)
  const [sortBy, setSortBy] = useState("rating")
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined)
  const [showFilters, setShowFilters] = useState(false)
  const [comparisonList, setComparisonList] = useState<number[]>([])
  const [showComparison, setShowComparison] = useState(false)
  const [appointmentSuccess, setAppointmentSuccess] = useState(false)

  // Filter doctors based on criteria
  useEffect(() => {
    const results = neurologists.filter((doctor) => {
      // Search term filter
      const matchesSearch =
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.hospital.toLowerCase().includes(searchTerm.toLowerCase())

      // Price range filter
      const matchesPrice = doctor.price >= priceRange[0] && doctor.price <= priceRange[1]

      // Rating filter
      const matchesRating = doctor.rating >= minRating

      // Insurance filter
      const matchesInsurance =
        selectedInsurance.length === 0 || selectedInsurance.some((ins) => doctor.insurance.includes(ins))

      // Telehealth filter
      const matchesTelehealth = !showTelehealth || doctor.telehealth

      // New patients filter
      const matchesNewPatients = !newPatientsOnly || doctor.newPatients

      return (
        matchesSearch && matchesPrice && matchesRating && matchesInsurance && matchesTelehealth && matchesNewPatients
      )
    })

    // Sort results
    if (sortBy === "rating") {
      results.sort((a, b) => b.rating - a.rating)
    } else if (sortBy === "price_low") {
      results.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price_high") {
      results.sort((a, b) => b.price - a.price)
    } else if (sortBy === "distance") {
      results.sort((a, b) => a.distance - b.distance)
    } else if (sortBy === "availability") {
      results.sort((a, b) => {
        const dateA = new Date(a.nextAvailable)
        const dateB = new Date(b.nextAvailable)
        return dateA.getTime() - dateB.getTime()
      })
    }

    setFilteredDoctors(results)
  }, [searchTerm, priceRange, minRating, selectedInsurance, showTelehealth, newPatientsOnly, sortBy])

  // Toggle doctor in comparison list
  const toggleComparison = (doctorId: number) => {
    if (comparisonList.includes(doctorId)) {
      setComparisonList(comparisonList.filter((id) => id !== doctorId))
    } else {
      if (comparisonList.length < 3) {
        setComparisonList([...comparisonList, doctorId])
      }
    }
  }

  // Handle insurance selection
  const handleInsuranceChange = (insurance: string) => {
    if (selectedInsurance.includes(insurance)) {
      setSelectedInsurance(selectedInsurance.filter((ins) => ins !== insurance))
    } else {
      setSelectedInsurance([...selectedInsurance, insurance])
    }
  }

  // Get available time slots for a given date
  const getAvailableTimeSlots = (date: Date | undefined, doctorId: number) => {
    if (!date) return []

    const doctor = neurologists.find((d) => d.id === doctorId)
    if (!doctor) return []

    const dayOfWeek = format(date, "EEEE")
    if (!doctor.availability.includes(dayOfWeek)) return []

    // Sample time slots
    return ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"]
  }

  // Book appointment
  const bookAppointment = () => {
    // In a real app, this would call a server action to save the appointment
    setAppointmentSuccess(true)
    setTimeout(() => {
      setAppointmentSuccess(false)
      setSelectedDoctor(null)
      setSelectedDate(undefined)
      setSelectedTime(undefined)
    }, 3000)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <MainNav />
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Find a Neurologist</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Search for neurologists specializing in Parkinson's disease in your area
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-12">
            {/* Filters - Desktop */}
            <div className="hidden md:block md:col-span-3 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="price-range">
                      Price Range (${priceRange[0]} - ${priceRange[1]})
                    </Label>
                    <Slider
                      id="price-range"
                      min={100}
                      max={500}
                      step={25}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="[&>span]:bg-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="min-rating">Minimum Rating ({minRating}+)</Label>
                    <Slider
                      id="min-rating"
                      min={1}
                      max={5}
                      step={0.5}
                      value={[minRating]}
                      onValueChange={(value) => setMinRating(value[0])}
                      className="[&>span]:bg-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Insurance</Label>
                    <div className="space-y-2">
                      {["Medicare", "Blue Cross", "Aetna", "UnitedHealthcare", "Cigna"].map((insurance) => (
                        <div key={insurance} className="flex items-center space-x-2">
                          <Checkbox
                            id={`insurance-${insurance}`}
                            checked={selectedInsurance.includes(insurance)}
                            onCheckedChange={() => handleInsuranceChange(insurance)}
                          />
                          <label
                            htmlFor={`insurance-${insurance}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {insurance}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Additional Options</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="telehealth"
                          checked={showTelehealth}
                          onCheckedChange={() => setShowTelehealth(!showTelehealth)}
                        />
                        <label
                          htmlFor="telehealth"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Telehealth Available
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="new-patients"
                          checked={newPatientsOnly}
                          onCheckedChange={() => setNewPatientsOnly(!newPatientsOnly)}
                        />
                        <label
                          htmlFor="new-patients"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Accepting New Patients
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sort-by">Sort By</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger id="sort-by">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="price_low">Price: Low to High</SelectItem>
                        <SelectItem value="price_high">Price: High to Low</SelectItem>
                        <SelectItem value="distance">Distance</SelectItem>
                        <SelectItem value="availability">Earliest Available</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSearchTerm("")
                      setPriceRange([200, 350])
                      setMinRating(4)
                      setSelectedInsurance([])
                      setShowTelehealth(false)
                      setNewPatientsOnly(false)
                      setSortBy("rating")
                    }}
                  >
                    Reset Filters
                  </Button>
                </CardFooter>
              </Card>

              {comparisonList.length > 0 && (
                <Card className="bg-purple-50 dark:bg-purple-900/20 border-primary">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Comparison</CardTitle>
                    <CardDescription>
                      {comparisonList.length} doctor{comparisonList.length > 1 ? "s" : ""} selected
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {comparisonList.map((id) => {
                        const doctor = neurologists.find((d) => d.id === id)
                        return doctor ? (
                          <div key={id} className="flex justify-between items-center">
                            <span className="text-sm truncate">{doctor.name}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleComparison(id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : null
                      })}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => setShowComparison(true)}>
                      Compare Doctors
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>

            {/* Main Content */}
            <div className="md:col-span-9">
              {/* Search and Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search by name, specialty, or hospital..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="md:hidden" onClick={() => setShowFilters(!showFilters)}>
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="price_low">Price: Low to High</SelectItem>
                      <SelectItem value="price_high">Price: High to Low</SelectItem>
                      <SelectItem value="distance">Distance</SelectItem>
                      <SelectItem value="availability">Earliest Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Mobile Filters */}
              {showFilters && (
                <Card className="mb-6 md:hidden">
                  <CardHeader>
                    <CardTitle className="text-lg">Filters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="mobile-price-range">
                        Price Range (${priceRange[0]} - ${priceRange[1]})
                      </Label>
                      <Slider
                        id="mobile-price-range"
                        min={100}
                        max={500}
                        step={25}
                        value={priceRange}
                        onValueChange={setPriceRange}
                        className="[&>span]:bg-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mobile-min-rating">Minimum Rating ({minRating}+)</Label>
                      <Slider
                        id="mobile-min-rating"
                        min={1}
                        max={5}
                        step={0.5}
                        value={[minRating]}
                        onValueChange={(value) => setMinRating(value[0])}
                        className="[&>span]:bg-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Insurance</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {["Medicare", "Blue Cross", "Aetna", "UnitedHealthcare", "Cigna"].map((insurance) => (
                          <div key={insurance} className="flex items-center space-x-2">
                            <Checkbox
                              id={`mobile-insurance-${insurance}`}
                              checked={selectedInsurance.includes(insurance)}
                              onCheckedChange={() => handleInsuranceChange(insurance)}
                            />
                            <label
                              htmlFor={`mobile-insurance-${insurance}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {insurance}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Additional Options</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="mobile-telehealth"
                            checked={showTelehealth}
                            onCheckedChange={() => setShowTelehealth(!showTelehealth)}
                          />
                          <label
                            htmlFor="mobile-telehealth"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Telehealth Available
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="mobile-new-patients"
                            checked={newPatientsOnly}
                            onCheckedChange={() => setNewPatientsOnly(!newPatientsOnly)}
                          />
                          <label
                            htmlFor="mobile-new-patients"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Accepting New Patients
                          </label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("")
                        setPriceRange([200, 350])
                        setMinRating(4)
                        setSelectedInsurance([])
                        setShowTelehealth(false)
                        setNewPatientsOnly(false)
                        setSortBy("rating")
                      }}
                    >
                      Reset
                    </Button>
                    <Button onClick={() => setShowFilters(false)}>Apply Filters</Button>
                  </CardFooter>
                </Card>
              )}

              {/* Comparison Button - Mobile */}
              {comparisonList.length > 0 && (
                <div className="md:hidden mb-6">
                  <Button className="w-full" onClick={() => setShowComparison(true)}>
                    Compare {comparisonList.length} Doctor{comparisonList.length > 1 ? "s" : ""}
                  </Button>
                </div>
              )}

              {/* Results */}
              <div className="space-y-6">
                {filteredDoctors.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-6">
                      <div className="text-center">
                        <h3 className="text-lg font-medium mb-2">No doctors match your criteria</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          Try adjusting your filters to see more results
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchTerm("")
                            setPriceRange([200, 350])
                            setMinRating(4)
                            setSelectedInsurance([])
                            setShowTelehealth(false)
                            setNewPatientsOnly(false)
                            setSortBy("rating")
                          }}
                        >
                          Reset All Filters
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  filteredDoctors.map((doctor) => (
                    <Card key={doctor.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="grid md:grid-cols-12 gap-4">
                          <div className="md:col-span-3 bg-gray-100 dark:bg-gray-800 p-6 flex flex-col items-center justify-center">
                            <img
                              src={doctor.image || "/placeholder.svg"}
                              alt={doctor.name}
                              className="rounded-full w-24 h-24 object-cover mb-4"
                            />
                            <div className="text-center">
                              <h3 className="font-bold">{doctor.name}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{doctor.specialty}</p>
                            </div>
                          </div>
                          <div className="md:col-span-6 p-6">
                            <div className="flex flex-col h-full justify-between">
                              <div>
                                <div className="flex items-center mb-2">
                                  <div className="flex items-center mr-4">
                                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                    <span className="font-medium">{doctor.rating}</span>
                                    <span className="text-gray-500 dark:text-gray-400 ml-1">({doctor.reviews})</span>
                                  </div>
                                  <div className="flex items-center">
                                    <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
                                    <span className="text-gray-500 dark:text-gray-400">{doctor.distance} miles</span>
                                  </div>
                                </div>
                                <p className="text-sm mb-2">{doctor.hospital}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{doctor.address}</p>
                                <p className="text-sm mb-4">{doctor.bio}</p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {doctor.insurance.map((ins) => (
                                    <Badge key={ins} variant="outline">
                                      {ins}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {doctor.telehealth && (
                                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                    Telehealth
                                  </Badge>
                                )}
                                {doctor.newPatients && (
                                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                                    Accepting New Patients
                                  </Badge>
                                )}
                                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                                  Languages: {doctor.languages.join(", ")}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="md:col-span-3 p-6 border-t md:border-t-0 md:border-l">
                            <div className="flex flex-col h-full justify-between">
                              <div>
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center">
                                    <DollarSign className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                    <span className="font-bold">${doctor.price}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
                                    <span className="text-sm">{doctor.nextAvailable}</span>
                                  </div>
                                </div>
                                <div className="space-y-2 mb-6">
                                  <p className="text-sm font-medium">Available on:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {doctor.availability.map((day) => (
                                      <Badge key={day} variant="outline">
                                        {day}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Button className="w-full" onClick={() => setSelectedDoctor(doctor.id)}>
                                  Book Appointment
                                </Button>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => toggleComparison(doctor.id)}
                                  >
                                    {comparisonList.includes(doctor.id) ? "Remove from Compare" : "Add to Compare"}
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Heart className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Share2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2025 ParkinTrack. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>

      {/* Appointment Booking Dialog */}
      {selectedDoctor && (
        <Dialog open={selectedDoctor !== null} onOpenChange={(open) => !open && setSelectedDoctor(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Book an Appointment</DialogTitle>
              <DialogDescription>{neurologists.find((d) => d.id === selectedDoctor)?.name}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="appointment-date">Select Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="appointment-date"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      disabled={(date) => {
                        const doctor = neurologists.find((d) => d.id === selectedDoctor)
                        if (!doctor) return true

                        const dayOfWeek = format(date, "EEEE")
                        return date < new Date() || !doctor.availability.includes(dayOfWeek)
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {selectedDate && (
                <div className="space-y-2">
                  <Label htmlFor="appointment-time">Select Time</Label>
                  <RadioGroup value={selectedTime} onValueChange={setSelectedTime} className="grid grid-cols-3 gap-2">
                    {getAvailableTimeSlots(selectedDate, selectedDoctor).map((time) => (
                      <div key={time}>
                        <RadioGroupItem value={time} id={`time-${time}`} className="peer sr-only" />
                        <Label
                          htmlFor={`time-${time}`}
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          {time}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="appointment-type">Appointment Type</Label>
                <Select defaultValue="in-person">
                  <SelectTrigger id="appointment-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-person">In-Person Visit</SelectItem>
                    <SelectItem
                      value="telehealth"
                      disabled={!neurologists.find((d) => d.id === selectedDoctor)?.telehealth}
                    >
                      Telehealth
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="appointment-reason">Reason for Visit</Label>
                <Select defaultValue="follow-up">
                  <SelectTrigger id="appointment-reason">
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new-patient">New Patient Consultation</SelectItem>
                    <SelectItem value="follow-up">Follow-up Visit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedDoctor(null)}>
                Cancel
              </Button>
              <Button onClick={bookAppointment} disabled={!selectedDate || !selectedTime}>
                Confirm Booking
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Comparison Dialog */}
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Doctor Comparison</DialogTitle>
            <DialogDescription>Compare doctors side by side</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
            {comparisonList.map((id) => {
              const doctor = neurologists.find((d) => d.id === id)
              return doctor ? (
                <Card key={id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2 text-center">
                    <img
                      src={doctor.image || "/placeholder.svg"}
                      alt={doctor.name}
                      className="rounded-full w-20 h-20 object-cover mx-auto mb-2"
                    />
                    <CardTitle className="text-base">{doctor.name}</CardTitle>
                    <CardDescription>{doctor.specialty}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Rating:</span>
                        <span className="font-medium flex items-center">
                          {doctor.rating} <Star className="h-3 w-3 text-yellow-400 ml-1" />
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Price:</span>
                        <span className="font-medium">${doctor.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Distance:</span>
                        <span className="font-medium">{doctor.distance} miles</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Next Available:</span>
                        <span className="font-medium">{doctor.nextAvailable}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Telehealth:</span>
                        <span className="font-medium">{doctor.telehealth ? "Yes" : "No"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">New Patients:</span>
                        <span className="font-medium">{doctor.newPatients ? "Yes" : "No"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 block mb-1">Insurance:</span>
                        <div className="flex flex-wrap gap-1">
                          {doctor.insurance.map((ins) => (
                            <Badge key={ins} variant="outline" className="text-xs">
                              {ins}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 block mb-1">Available on:</span>
                        <div className="flex flex-wrap gap-1">
                          {doctor.availability.map((day) => (
                            <Badge key={day} variant="outline" className="text-xs">
                              {day}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button
                      className="w-full"
                      onClick={() => {
                        setShowComparison(false)
                        setSelectedDoctor(doctor.id)
                      }}
                    >
                      Book Appointment
                    </Button>
                  </CardFooter>
                </Card>
              ) : null
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowComparison(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={appointmentSuccess} onOpenChange={setAppointmentSuccess}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Appointment Confirmed!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Your appointment has been successfully scheduled. You will receive a confirmation email shortly.
            </p>
            <Button onClick={() => setAppointmentSuccess(false)}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

