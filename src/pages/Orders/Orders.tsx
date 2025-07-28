// import { useEffect, useState, useMemo, useRef } from "react";
// import { collection, getDocs, Timestamp } from "firebase/firestore";
// import { db } from "../../services/firebase";
// import {
//   Box,
//   CircularProgress,
//   Container,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   TableSortLabel,
//   Typography,
//   TextField,
//   MenuItem,
//   Button,
//   Pagination,
//   Tooltip,
//   InputAdornment,
//   useTheme,
//   IconButton,
//   List,
//   ListItem,
//   ListItemText,
//   Divider,
// } from "@mui/material";
// import { format } from "date-fns";
// import { Close, Search } from "@mui/icons-material";
// import GoogleIcon from "@mui/icons-material/Google";
// import FacebookIcon from "@mui/icons-material/Facebook";
// import InstagramIcon from "@mui/icons-material/Instagram";
// import { motion, AnimatePresence } from "framer-motion";

// type DateInput = Timestamp | Date | number | string;

// interface Transaction {
//   id: string;
//   amount: number;
//   currency: string;
//   status: string;
//   timestamp: DateInput;
//   userId: string;
//   userName: string;
//   userPhone?: string;
//   referenceId?: string;
//   campaignType?: string;
//   costPerLead?: number;
//   duration?: string;
//   leads?: number;
//   txnid?: string;
//   [key: string]: any;
// }

// const ITEMS_PER_PAGE = 10;

// const convertToDate = (value: DateInput): Date | null => {
//   if (value instanceof Timestamp) return value.toDate();
//   if (value instanceof Date) return value;
//   if (typeof value === "number") return new Date(value);
//   if (typeof value === "string") {
//     const date = new Date(value);
//     return isNaN(date.getTime()) ? null : date;
//   }
//   return null;
// };

// const Orders = () => {
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [sortField, setSortField] = useState<keyof Transaction>("timestamp");
//   const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
//   const [filterStatus, setFilterStatus] = useState<string>("all");
//   const [filterPlatform, setFilterPlatform] = useState<string>("all");
//   const [searchQuery, setSearchQuery] = useState<string>("");
//   const [page, setPage] = useState(1);
//   const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
//   const theme = useTheme();
//   const tableContainerRef = useRef<HTMLDivElement>(null);
//   const [tableHeight, setTableHeight] = useState<number | null>(null);

//   useEffect(() => {
//     const fetchAllTransactions = async () => {
//       try {
//         setLoading(true);
//         const usersSnapshot = await getDocs(collection(db, "crm_users"));
//         const allTransactions: Transaction[] = [];

//         for (const userDoc of usersSnapshot.docs) {
//           const userId = userDoc.id;
//           const userData = userDoc.data();
//           const userName = userData.displayName || userId;
//           const userPhone = userData.phone || "";
//           const transactionsRef = collection(db, `crm_users/${userId}/transactions`);

//           try {
//             const transactionsSnapshot = await getDocs(transactionsRef);
//             transactionsSnapshot.forEach((transactionDoc) => {
//               const data = transactionDoc.data();
//               allTransactions.push({
//                 ...data,
//                 id: transactionDoc.id,
//                 userId,
//                 userName,
//                 userPhone: userPhone || data.phone || data.userPhone || "",
//                 referenceId: data.referenceId || data.txnid || data.id,
//                 costPerLead: data.costPerLead,
//                 duration: data.duration,
//                 leads: data.leads,
//                 txnid: data.txnid
//               } as Transaction);
//             });
//           } catch (subError) {
//             console.error(`Error fetching transactions for user ${userId}:`, subError);
//           }
//         }

//         setTransactions(allTransactions);
//       } catch (err) {
//         console.error("Error fetching transactions:", err);
//         setError("Failed to load transactions. Please try again later.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAllTransactions();
//   }, []);

//   useEffect(() => {
//     if (!loading && tableContainerRef.current) {
//       setTableHeight(tableContainerRef.current.clientHeight);
//     }
//   }, [loading, transactions]);

//   const handleSort = (field: keyof Transaction) => {
//     const isAsc = sortField === field && sortDirection === "asc";
//     setSortDirection(isAsc ? "desc" : "asc");
//     setSortField(field);
//   };

//   const filteredTransactions = useMemo(() => {
//     return transactions.filter((transaction) => {
//       if (filterStatus !== "all" && transaction.status !== filterStatus) return false;
      
//       if (filterPlatform !== "all") {
//         const campaignType = (transaction.campaignType || "").toLowerCase();
//         if (filterPlatform === "google" && campaignType !== "google") return false;
//         if (filterPlatform === "meta" && !["meta", "instagram", "facebook"].includes(campaignType)) return false;
//       }

//       if (!searchQuery) return true;
      
//       const searchLower = searchQuery.toLowerCase();
//       return (
//         transaction.id.toLowerCase().includes(searchLower) ||
//         transaction.userName.toLowerCase().includes(searchLower) ||
//         String(transaction.amount).includes(searchQuery) ||
//         transaction.status.toLowerCase().includes(searchLower) ||
//         (transaction.referenceId && transaction.referenceId.toLowerCase().includes(searchLower)) ||
//         (transaction.userPhone && transaction.userPhone.toLowerCase().includes(searchLower)) ||
//         (transaction.txnid && transaction.txnid.toLowerCase().includes(searchLower))
//       );
//     });
//   }, [transactions, filterStatus, filterPlatform, searchQuery]);

//   const sortedTransactions = useMemo(() => {
//     return [...filteredTransactions].sort((a, b) => {
//       const aValue = a[sortField];
//       const bValue = b[sortField];

//       if (aValue === undefined && bValue === undefined) return 0;
//       if (aValue === undefined) return 1;
//       if (bValue === undefined) return -1;

//       if (sortField === "timestamp") {
//         const aDate = convertToDate(aValue);
//         const bDate = convertToDate(bValue);
//         if (aDate && bDate) {
//           return sortDirection === "asc" 
//             ? aDate.getTime() - bDate.getTime() 
//             : bDate.getTime() - aDate.getTime();
//         }
//         return 0;
//       }

//       if (typeof aValue === "string" && typeof bValue === "string") {
//         return sortDirection === "asc" 
//           ? aValue.localeCompare(bValue) 
//           : bValue.localeCompare(aValue);
//       }

//       if (typeof aValue === "number" && typeof bValue === "number") {
//         return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
//       }

//       return 0;
//     });
//   }, [filteredTransactions, sortField, sortDirection]);

//   const formatDate = (dateValue: DateInput) => {
//     const date = convertToDate(dateValue);
//     return date ? format(date, "dd MMM yyyy, hh:mm a") : "N/A";
//   };

//   const formatCurrency = (amount: number, currency: string) => {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: currency || "INR",
//     }).format(amount);
//   };

//   const formatId = (id: string) => {
//     if (id.length > 10) {
//       return `${id.substring(0, 6)}...${id.substring(id.length - 4)}`;
//     }
//     return id;
//   };

//   const handleViewDetails = (transaction: Transaction) => {
//     setSelectedTransaction(transaction);
//   };

//   const handleCloseDetails = () => {
//     setSelectedTransaction(null);
//   };

//   const renderPlatform = (campaignType?: string) => {
//     if (!campaignType) return "N/A";
//     const type = campaignType.toLowerCase();

//     return (
//       <Box display="flex" justifyContent="center">
//         {type === "google" ? (
//           <Tooltip title="Google Ads">
//             <GoogleIcon fontSize="small" sx={{ color: "#4285F4" }} />
//           </Tooltip>
//         ) : type === "facebook" ? (
//           <Tooltip title="Facebook Ads">
//             <FacebookIcon fontSize="small" sx={{ color: '#4267B2' }} />
//           </Tooltip>
//         ) : type === "instagram" ? (
//           <Tooltip title="Instagram Ads">
//             <InstagramIcon fontSize="small" sx={{ color: "#E1306C" }} />
//           </Tooltip>
//         ) : type === "meta" ? (
//           <Tooltip title="Meta Ads">
//             <FacebookIcon fontSize="small" sx={{ color: '#4267B2' }} />
//           </Tooltip>
//         ) : (
//           <Typography variant="body2" fontSize="0.75rem">{campaignType}</Typography>
//         )}
//       </Box>
//     );
//   };

//   const pageCount = Math.ceil(sortedTransactions.length / ITEMS_PER_PAGE);
//   const paginatedTransactions = useMemo(() => {
//     const start = (page - 1) * ITEMS_PER_PAGE;
//     return sortedTransactions.slice(start, start + ITEMS_PER_PAGE);
//   }, [sortedTransactions, page]);

//   const statusOptions = [
//     { value: "all", label: "All Statuses" },
//     { value: "completed", label: "Completed" },
//     { value: "pending", label: "Pending" },
//     { value: "failed", label: "Failed" },
//     { value: "refunded", label: "Refunded" },
//     { value: "processing", label: "Processing" },
//     { value: "cancelled", label: "Cancelled" },
//   ];

//   const platformOptions = [
//     { value: "all", label: "All Platforms" },
//     { value: "google", label: "Google" },
//     { value: "meta", label: "Meta" },
//   ];

//   if (loading) {
//     return (
//       <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
//         <CircularProgress size={60} />
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Container maxWidth="md" sx={{ mt: 4, textAlign: "center" }}>
//         <Typography variant="h5" color="error" gutterBottom>
//           {error}
//         </Typography>
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={() => window.location.reload()}
//           sx={{ mt: 2 }}
//         >
//           Retry
//         </Button>
//       </Container>
//     );
//   }

//   return (
//     <Container maxWidth="xl" sx={{ py: 4, position: 'relative' }}>
//       <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
//         Orders
//       </Typography>

//       {/* Filters and Search */}
//       <Paper
//         sx={{
//           mb: 3,
//           p: 2,
//           display: "flex",
//           flexWrap: "wrap",
//           gap: 1.5,
//           alignItems: "center",
//           borderRadius: 1,
//           background: "white",
//           boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
//         }}
//       >
//         <TextField
//           label="Search Transactions"
//           variant="outlined"
//           size="small"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           sx={{
//             flexGrow: 1,
//             maxWidth: 300,
//             '& .MuiInputBase-root': {
//               height: 36,
//               fontSize: '0.8125rem',
//             },
//             '& .MuiInputLabel-root': {
//               fontSize: '0.8125rem',
//               transform: 'translate(14px, 10px) scale(1)',
//               '&.MuiInputLabel-shrink': {
//                 transform: 'translate(14px, -6px) scale(0.75)',
//               },
//             },
//           }}
//           InputProps={{
//             startAdornment: (
//               <InputAdornment position="start" sx={{ ml: 0.5 }}>
//                 <Search fontSize="small" sx={{ color: 'text.secondary' }} />
//               </InputAdornment>
//             ),
//           }}
//         />

//         <TextField
//           select
//           label="Status"
//           variant="outlined"
//           size="small"
//           value={filterStatus}
//           onChange={(e) => setFilterStatus(e.target.value)}
//           sx={{
//             minWidth: 140,
//             '& .MuiInputBase-root': {
//               height: 36,
//               fontSize: '0.8125rem',
//             },
//             '& .MuiInputLabel-root': {
//               fontSize: '0.8125rem',
//               transform: 'translate(14px, 10px) scale(1)',
//               '&.MuiInputLabel-shrink': {
//                 transform: 'translate(14px, -6px) scale(0.75)',
//               },
//             },
//           }}
//         >
//           {statusOptions.map((option) => (
//             <MenuItem 
//               key={option.value} 
//               value={option.value}
//               sx={{ fontSize: '0.8125rem', py: 0.5 }}
//             >
//               {option.label}
//             </MenuItem>
//           ))}
//         </TextField>

//         <TextField
//           select
//           label="Platform"
//           variant="outlined"
//           size="small"
//           value={filterPlatform}
//           onChange={(e) => setFilterPlatform(e.target.value)}
//           sx={{
//             minWidth: 140,
//             '& .MuiInputBase-root': {
//               height: 36,
//               fontSize: '0.8125rem',
//             },
//             '& .MuiInputLabel-root': {
//               fontSize: '0.8125rem',
//               transform: 'translate(14px, 10px) scale(1)',
//               '&.MuiInputLabel-shrink': {
//                 transform: 'translate(14px, -6px) scale(0.75)',
//               },
//             },
//           }}
//         >
//           {platformOptions.map((option) => (
//             <MenuItem 
//               key={option.value} 
//               value={option.value}
//               sx={{ fontSize: '0.8125rem', py: 0.5 }}
//             >
//               {option.label}
//             </MenuItem>
//           ))}
//         </TextField>

//         <Button
//           variant="outlined"
//           onClick={() => {
//             setSearchQuery("");
//             setFilterStatus("all");
//             setFilterPlatform("all");
//           }}
//           sx={{
//             ml: "auto",
//             fontSize: '0.8125rem',
//             height: 36,
//             px: 2,
//             textTransform: 'none',
//             borderColor: 'grey.300',
//             color: 'text.secondary',
//             '&:hover': {
//               borderColor: 'grey.400',
//             },
//           }}
//         >
//           Clear Filters
//         </Button>
//       </Paper>

//       {/* Results count */}
//       <Typography variant="body2" sx={{ mb: 2, color: "text.secondary", fontSize: '0.8125rem' }}>
//         Showing {paginatedTransactions.length} of {filteredTransactions.length} transactions
//         {filteredTransactions.length !== transactions.length &&
//           ` (filtered from ${transactions.length} total)`}
//       </Typography>

//       {/* Table Container with ref for height measurement */}
//       <Box position="relative" ref={tableContainerRef}>
//         <TableContainer
//           component={Paper}
//           sx={{
//             mb: 3,
//             borderRadius: 1,
//             boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
//             position: 'relative',
//             overflow: selectedTransaction ? 'hidden' : 'auto',
//           }}
//         >
//           <Table size="small">
//             <TableHead>
//               <TableRow sx={{ backgroundColor: "#f8fafc" }}>
//                 <TableCell sx={{ fontWeight: 600, fontSize: "0.8125rem" }}>
//                   <TableSortLabel
//                     active={sortField === "timestamp"}
//                     direction={sortDirection}
//                     onClick={() => handleSort("timestamp")}
//                   >
//                     Date & Time
//                   </TableSortLabel>
//                 </TableCell>
//                 <TableCell
//                   align="center"
//                   sx={{ fontWeight: 600, fontSize: "0.8125rem" }}
//                 >
//                   Platform
//                 </TableCell>
//                 <TableCell sx={{ fontWeight: 600, fontSize: "0.8125rem" }}>
//                   <TableSortLabel
//                     active={sortField === "id"}
//                     direction={sortDirection}
//                     onClick={() => handleSort("id")}
//                   >
//                     Transaction ID
//                   </TableSortLabel>
//                 </TableCell>
//                 <TableCell sx={{ fontWeight: 600, fontSize: "0.8125rem" }}>
//                   User
//                 </TableCell>
//                 <TableCell
//                   align="right"
//                   sx={{ fontWeight: 600, fontSize: "0.8125rem" }}
//                 >
//                   <TableSortLabel
//                     active={sortField === "amount"}
//                     direction={sortDirection}
//                     onClick={() => handleSort("amount")}
//                   >
//                     Amount
//                   </TableSortLabel>
//                 </TableCell>
//                 <TableCell sx={{ fontWeight: 600, fontSize: "0.8125rem" }}>
//                   <TableSortLabel
//                     active={sortField === "status"}
//                     direction={sortDirection}
//                     onClick={() => handleSort("status")}
//                   >
//                     Status
//                   </TableSortLabel>
//                 </TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {paginatedTransactions.length > 0 ? (
//                 paginatedTransactions.map((transaction) => (
//                   <TableRow 
//                     key={transaction.id} 
//                     hover
//                     onClick={() => handleViewDetails(transaction)}
//                     sx={{ 
//                       cursor: 'pointer',
//                       '&:hover': {
//                         backgroundColor: theme.palette.action.hover,
//                       }
//                     }}
//                   >
//                     <TableCell sx={{ fontSize: "0.8125rem" }}>
//                       {formatDate(transaction.timestamp)}
//                     </TableCell>
//                     <TableCell align="center" sx={{ fontSize: "0.8125rem" }}>
//                       {renderPlatform(transaction.campaignType)}
//                     </TableCell>
//                     <TableCell sx={{ fontSize: "0.8125rem" }}>
//                       {formatId(transaction.id)}
//                     </TableCell>
//                     <TableCell sx={{ fontSize: "0.8125rem" }}>
//                       <Box>
//                         <Typography fontWeight={500} fontSize="0.8125rem">
//                           {transaction.userName}
//                         </Typography>
//                         <Typography
//                           variant="body2"
//                           color="textSecondary"
//                           fontSize="0.75rem"
//                         >
//                           {transaction.userPhone || "N/A"}
//                         </Typography>
//                       </Box>
//                     </TableCell>
//                     <TableCell
//                       align="right"
//                       sx={{ fontWeight: 600, fontSize: "0.8125rem" }}
//                     >
//                       {formatCurrency(transaction.amount, transaction.currency)}
//                     </TableCell>
//                     <TableCell sx={{ fontSize: "0.8125rem" }}>
//                       <Box
//                         sx={{
//                           display: 'inline-flex',
//                           alignItems: 'center',
//                           px: 1,
//                           py: 0.3,
//                           borderRadius: 0.5,
//                           fontSize: '0.75rem',
//                           fontWeight: 500,
//                           backgroundColor:
//                             transaction.status === "completed"
//                               ? "rgba(46, 125, 50, 0.1)"
//                               : transaction.status === "pending"
//                               ? "rgba(245, 127, 23, 0.1)"
//                               : transaction.status === "failed"
//                               ? "rgba(198, 40, 40, 0.1)"
//                               : transaction.status === "refunded"
//                               ? "rgba(21, 101, 192, 0.1)"
//                               : transaction.status === "processing"
//                               ? "rgba(2, 119, 189, 0.1)"
//                               : transaction.status === "cancelled"
//                               ? "rgba(97, 97, 97, 0.1)"
//                               : "#f5f5f5",
//                           color:
//                             transaction.status === "completed"
//                               ? "#2e7d32"
//                               : transaction.status === "pending"
//                               ? "#f57f17"
//                               : transaction.status === "failed"
//                               ? "#c62828"
//                               : transaction.status === "refunded"
//                               ? "#1565c0"
//                               : transaction.status === "processing"
//                               ? "#0277bd"
//                               : transaction.status === "cancelled"
//                               ? "#616161"
//                               : "#424242",
//                         }}
//                       >
//                         {transaction.status.charAt(0).toUpperCase() +
//                           transaction.status.slice(1)}
//                       </Box>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
//                     <Typography variant="body1" color="textSecondary">
//                       No transactions found
//                     </Typography>
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </TableContainer>

//         {/* Transaction Details Side Panel */}
//         <AnimatePresence>
//           {selectedTransaction && tableHeight && (
//             <>
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 transition={{ duration: 0.2 }}
//                 style={{
//                   position: 'absolute',
//                   top: 0,
//                   left: 0,
//                   right: 0,
//                   height: tableHeight,
//                   backgroundColor: 'rgba(0,0,0,0.05)',
//                   zIndex: theme.zIndex.drawer,
//                   cursor: 'pointer',
//                 }}
//                 onClick={handleCloseDetails}
//               />
//               <motion.div
//                 initial={{ x: '100%' }}
//                 animate={{ x: 0 }}
//                 exit={{ x: '100%' }}
//                 transition={{ 
//                   type: 'spring',
//                   damping: 22,
//                   stiffness: 300
//                 }}
//                 style={{
//                   position: 'absolute',
//                   top: 0,
//                   right: 0,
//                   height: tableHeight,
//                   width: 'min(90vw, 500px)',
//                   backgroundColor: 'white',
//                   boxShadow: '-2px 0 20px rgba(0,0,0,0.1)',
//                   zIndex: theme.zIndex.drawer + 1,
//                   overflowY: 'auto',
//                 }}
//               >
//                 <Box sx={{ p: 3 }}>
//                   <Box 
//                     sx={{ 
//                       display: 'flex', 
//                       justifyContent: 'space-between', 
//                       alignItems: 'center',
//                       mb: 2
//                     }}
//                   >
//                     <Typography variant="h6" fontWeight={600}>
//                       Transaction Details
//                     </Typography>
//                     <IconButton onClick={handleCloseDetails}>
//                       <Close />
//                     </IconButton>
//                   </Box>
                  
//                   <List dense sx={{ width: '100%', bgcolor: 'background.paper' }}>
//                     {Object.entries(selectedTransaction).filter(([key]) => 
//                       key !== 'userId' && key !== 'id' && key !== 'referenceId'
//                     ).map(([key, value]) => {
//                       let displayValue: React.ReactNode = value;
                      
//                       // Format known fields
//                       if (key === 'timestamp') {
//                         displayValue = formatDate(value);
//                       } else if (key === 'amount') {
//                         displayValue = formatCurrency(
//                           value as number,
//                           selectedTransaction.currency || 'INR'
//                         );
//                       } else if (key === 'campaignType') {
//                         displayValue = renderPlatform(value as string);
//                       } else if (key === 'txnid') {
//                         displayValue = (
//                           <Box sx={{ display: 'flex', flexDirection: 'column' }}>
//                             <Typography variant="body2" fontSize="0.75rem">
//                               {formatId(String(value))}
//                             </Typography>
//                             <Typography 
//                               variant="caption" 
//                               color="textSecondary"
//                               fontSize="0.625rem"
//                               sx={{ wordBreak: 'break-all' }}
//                             >
//                               {value}
//                             </Typography>
//                           </Box>
//                         );
//                       } else if (key === 'costPerLead') {
//                         displayValue = formatCurrency(
//                           value as number,
//                           selectedTransaction.currency || 'INR'
//                         ) + ' per lead';
//                       } else if (typeof value === 'string' && value.length > 40) {
//                         displayValue = (
//                           <Box sx={{ display: 'flex', flexDirection: 'column' }}>
//                             <Typography variant="body2" fontSize="0.75rem">
//                               {value.substring(0, 40)}...
//                             </Typography>
//                             <Typography 
//                               variant="caption" 
//                               color="textSecondary"
//                               fontSize="0.625rem"
//                               sx={{ wordBreak: 'break-all' }}
//                             >
//                               {value}
//                             </Typography>
//                           </Box>
//                         );
//                       }
                      
//                       return (
//                         <div key={key}>
//                           <ListItem>
//                             <ListItemText
//                               primary={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
//                               primaryTypographyProps={{ 
//                                 fontWeight: 500, 
//                                 fontSize: '0.75rem',
//                                 color: 'text.secondary'
//                               }}
//                               secondary={displayValue}
//                               secondaryTypographyProps={{ 
//                                 fontSize: '0.75rem',
//                                 sx: { 
//                                   wordBreak: 'break-word',
//                                   ...(key === 'campaignType' ? { display: 'flex', justifyContent: 'flex-start' } : {})
//                                 }
//                               }}
//                             />
//                           </ListItem>
//                           <Divider component="li" />
//                         </div>
//                       );
//                     })}
//                   </List>
                  
//                   <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
//                     <Button 
//                       variant="contained" 
//                       onClick={handleCloseDetails}
//                       sx={{ textTransform: 'none', fontSize: '0.75rem' }}
//                     >
//                       Close
//                     </Button>
//                   </Box>
//                 </Box>
//               </motion.div>
//             </>
//           )}
//         </AnimatePresence>
//       </Box>

//       {/* Pagination */}
//       {pageCount > 1 && (
//         <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
//           <Pagination
//             count={pageCount}
//             page={page}
//             onChange={(_, value) => setPage(value)}
//             color="primary"
//             size="small"
//             showFirstButton
//             showLastButton
//           />
//         </Box>
//       )}
//     </Container>
//   );
// };

// export default Orders;











import { useEffect, useState, useMemo, useRef } from "react";
import { collection, getDocs, Timestamp, doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import {
  Box,
  CircularProgress,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  TextField,
  MenuItem,
  Button,
  Pagination,
  Tooltip,
  InputAdornment,
  useTheme,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  // Autocomplete,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  LinearProgress,
} from "@mui/material";
import { format } from "date-fns";
import { Close, Search } from "@mui/icons-material";
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import { motion, AnimatePresence } from "framer-motion";
import { getAuth } from "firebase/auth";

type DateInput = Timestamp | Date | number | string;

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  timestamp: DateInput;
  userId: string;
  userName: string;
  userPhone?: string;
  referenceId?: string;
  campaignType?: string;
  costPerLead?: number;
  duration?: string;
  leads?: number;
  txnid?: string;
  [key: string]: any;
}

interface User {
  phoneNumber: string;
  displayName: string;
}

const ITEMS_PER_PAGE = 10;

const convertToDate = (value: DateInput): Date | null => {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  if (typeof value === "string") {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
};

const fetchAllUsers = async (): Promise<User[]> => {
  try {
    const usersSnapshot = await getDocs(collection(db, "crm_users"));
    return usersSnapshot.docs.map((doc) => ({
      phoneNumber: doc.id,
      displayName: doc.data().displayName || doc.id,
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

const Orders = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Transaction>("timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const theme = useTheme();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [tableHeight, setTableHeight] = useState<number | null>(null);
  
  // Admin user management
  const [isAdmin, setIsAdmin] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSwitchLoading, setUserSwitchLoading] = useState(false);
  const [viewingUserName, setViewingUserName] = useState("");

  useEffect(() => {
    const checkAdminStatus = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user || !user.phoneNumber) {
        setIsAdmin(false);
        return;
      }

      try {
        const sanitizedPhone = user.phoneNumber.replace(/[^\d]/g, "");
        const userDoc = await getDoc(doc(db, "crm_users", sanitizedPhone));
        
        if (userDoc.exists() && userDoc.data().isAdmin) {
          setIsAdmin(true);
          setUsersLoading(true);
          try {
            const users = await fetchAllUsers();
            setAllUsers(users);
          } catch (err) {
            console.error("Failed to fetch users", err);
          } finally {
            setUsersLoading(false);
          }
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setUserSwitchLoading(true);
        setError(null);
        
        const auth = getAuth();
        const currentUser = auth.currentUser;
        let targetUserPhone = "";
        let targetUserName = "Your Orders";
        
        // Determine which user's transactions to fetch
        if (isAdmin && selectedUser) {
          // Admin selected a specific user
          targetUserPhone = selectedUser;
          const user = allUsers.find(u => u.phoneNumber === selectedUser);
          targetUserName = user ? `${user.displayName}'s Orders` : "User Orders";
        } else if (isAdmin && !selectedUser) {
          // Admin viewing all transactions
          targetUserPhone = "";
          targetUserName = "All Orders";
        } else {
          // Regular user - only their own transactions
          if (currentUser?.phoneNumber) {
            targetUserPhone = currentUser.phoneNumber.replace(/[^\d]/g, "");
            targetUserName = currentUser.displayName 
              ? `${currentUser.displayName}'s Orders` 
              : "Your Orders";
          } else {
            setError("User not authenticated or phone number missing");
            setLoading(false);
            return;
          }
        }
        
        setViewingUserName(targetUserName);
        
        const allTransactions: Transaction[] = [];
        let usersToFetch: User[] = [];
        
        if (isAdmin && !selectedUser) {
          // Fetch transactions for all users
          usersToFetch = allUsers;
        } else {
          // Fetch for specific user
          const targetUser = allUsers.find(u => u.phoneNumber === targetUserPhone) || {
            phoneNumber: targetUserPhone,
            displayName: targetUserPhone
          };
          usersToFetch = [targetUser];
        }

        for (const user of usersToFetch) {
          const userId = user.phoneNumber;
          const transactionsRef = collection(db, `crm_users/${userId}/transactions`);

          try {
            const transactionsSnapshot = await getDocs(transactionsRef);
            transactionsSnapshot.forEach((transactionDoc) => {
              const data = transactionDoc.data();
              allTransactions.push({
                ...data,
                id: transactionDoc.id,
                userId,
                userName: user.displayName,
                userPhone: userId,
                referenceId: data.referenceId || data.txnid || data.id,
                costPerLead: data.costPerLead,
                duration: data.duration,
                leads: data.leads,
                txnid: data.txnid
              } as Transaction);
            });
          } catch (subError) {
            console.error(`Error fetching transactions for user ${userId}:`, subError);
          }
        }

        setTransactions(allTransactions);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Failed to load transactions. Please try again later.");
      } finally {
        setLoading(false);
        setUserSwitchLoading(false);
      }
    };

    fetchTransactions();
  }, [isAdmin, selectedUser, allUsers]);

  useEffect(() => {
    if (!loading && tableContainerRef.current) {
      setTableHeight(tableContainerRef.current.clientHeight);
    }
  }, [loading, transactions]);

  const handleSort = (field: keyof Transaction) => {
    const isAsc = sortField === field && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortField(field);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (filterStatus !== "all" && transaction.status !== filterStatus) return false;
      
      if (filterPlatform !== "all") {
        const campaignType = (transaction.campaignType || "").toLowerCase();
        if (filterPlatform === "google" && campaignType !== "google") return false;
        if (filterPlatform === "meta" && !["meta", "instagram", "facebook"].includes(campaignType)) return false;
      }

      if (!searchQuery) return true;
      
      const searchLower = searchQuery.toLowerCase();
      return (
        transaction.id.toLowerCase().includes(searchLower) ||
        transaction.userName.toLowerCase().includes(searchLower) ||
        String(transaction.amount).includes(searchQuery) ||
        transaction.status.toLowerCase().includes(searchLower) ||
        (transaction.referenceId && transaction.referenceId.toLowerCase().includes(searchLower)) ||
        (transaction.userPhone && transaction.userPhone.toLowerCase().includes(searchLower)) ||
        (transaction.txnid && transaction.txnid.toLowerCase().includes(searchLower))
      );
    });
  }, [transactions, filterStatus, filterPlatform, searchQuery]);

  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;

      if (sortField === "timestamp") {
        const aDate = convertToDate(aValue);
        const bDate = convertToDate(bValue);
        if (aDate && bDate) {
          return sortDirection === "asc" 
            ? aDate.getTime() - bDate.getTime() 
            : bDate.getTime() - aDate.getTime();
        }
        return 0;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [filteredTransactions, sortField, sortDirection]);

  const formatDate = (dateValue: DateInput) => {
    const date = convertToDate(dateValue);
    return date ? format(date, "dd MMM yyyy, hh:mm a") : "N/A";
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
    }).format(amount);
  };

  const formatId = (id: string) => {
    if (id.length > 10) {
      return `${id.substring(0, 6)}...${id.substring(id.length - 4)}`;
    }
    return id;
  };

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleCloseDetails = () => {
    setSelectedTransaction(null);
  };

  const renderPlatform = (campaignType?: string) => {
    if (!campaignType) return "N/A";
    const type = campaignType.toLowerCase();

    return (
      <Box display="flex" justifyContent="center">
        {type === "google" ? (
          <Tooltip title="Google Ads">
            <GoogleIcon fontSize="small" sx={{ color: "#4285F4" }} />
          </Tooltip>
        ) : type === "facebook" ? (
          <Tooltip title="Facebook Ads">
            <FacebookIcon fontSize="small" sx={{ color: '#4267B2' }} />
          </Tooltip>
        ) : type === "instagram" ? (
          <Tooltip title="Instagram Ads">
            <InstagramIcon fontSize="small" sx={{ color: "#E1306C" }} />
          </Tooltip>
        ) : type === "meta" ? (
          <Tooltip title="Meta Ads">
            <FacebookIcon fontSize="small" sx={{ color: '#4267B2' }} />
          </Tooltip>
        ) : (
          <Typography variant="body2" fontSize="0.75rem">{campaignType}</Typography>
        )}
      </Box>
    );
  };

  const pageCount = Math.ceil(sortedTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return sortedTransactions.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedTransactions, page]);

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "completed", label: "Completed" },
    { value: "pending", label: "Pending" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" },
    { value: "processing", label: "Processing" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const platformOptions = [
    { value: "all", label: "All Platforms" },
    { value: "google", label: "Google" },
    { value: "meta", label: "Meta" },
  ];

  const handleUserChange = (value: string | null) => {
    setSelectedUser(value);
  };

  if (loading || userSwitchLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4, flexDirection: 'column', alignItems: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading orders...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, position: 'relative' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          {viewingUserName}
        </Typography>
        
        {isAdmin && (
          <FormControl sx={{ minWidth: 240, mb: 2 }} size="small">
            <InputLabel>Select User</InputLabel>
            <Select
              value={selectedUser || 'all'}
              onChange={(e) => handleUserChange(e.target.value === 'all' ? null : e.target.value)}
              label="Select User"
              disabled={usersLoading}
            >
              <MenuItem value="all">All Users</MenuItem>
              {allUsers.map((user) => (
                <MenuItem key={user.phoneNumber} value={user.phoneNumber}>
                  {user.displayName}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {usersLoading ? "Loading users..." : "View specific user orders"}
            </FormHelperText>
          </FormControl>
        )}
      </Box>

      {/* Filters and Search */}
      <Paper
        sx={{
          mb: 3,
          p: 2,
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          alignItems: "center",
          borderRadius: 1,
          background: "white",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
        }}
      >
        <TextField
          label="Search Transactions"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            flexGrow: 1,
            maxWidth: 300,
            '& .MuiInputBase-root': {
              height: 36,
              fontSize: '0.8125rem',
            },
            '& .MuiInputLabel-root': {
              fontSize: '0.8125rem',
              transform: 'translate(14px, 10px) scale(1)',
              '&.MuiInputLabel-shrink': {
                transform: 'translate(14px, -6px) scale(0.75)',
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ ml: 0.5 }}>
                <Search fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          select
          label="Status"
          variant="outlined"
          size="small"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          sx={{
            minWidth: 140,
            '& .MuiInputBase-root': {
              height: 36,
              fontSize: '0.8125rem',
            },
            '& .MuiInputLabel-root': {
              fontSize: '0.8125rem',
              transform: 'translate(14px, 10px) scale(1)',
              '&.MuiInputLabel-shrink': {
                transform: 'translate(14px, -6px) scale(0.75)',
              },
            },
          }}
        >
          {statusOptions.map((option) => (
            <MenuItem 
              key={option.value} 
              value={option.value}
              sx={{ fontSize: '0.8125rem', py: 0.5 }}
            >
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Platform"
          variant="outlined"
          size="small"
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value)}
          sx={{
            minWidth: 140,
            '& .MuiInputBase-root': {
              height: 36,
              fontSize: '0.8125rem',
            },
            '& .MuiInputLabel-root': {
              fontSize: '0.8125rem',
              transform: 'translate(14px, 10px) scale(1)',
              '&.MuiInputLabel-shrink': {
                transform: 'translate(14px, -6px) scale(0.75)',
              },
            },
          }}
        >
          {platformOptions.map((option) => (
            <MenuItem 
              key={option.value} 
              value={option.value}
              sx={{ fontSize: '0.8125rem', py: 0.5 }}
            >
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <Button
          variant="outlined"
          onClick={() => {
            setSearchQuery("");
            setFilterStatus("all");
            setFilterPlatform("all");
          }}
          sx={{
            ml: "auto",
            fontSize: '0.8125rem',
            height: 36,
            px: 2,
            textTransform: 'none',
            borderColor: 'grey.300',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'grey.400',
            },
          }}
        >
          Clear Filters
        </Button>
      </Paper>

      {/* Results count */}
      <Typography variant="body2" sx={{ mb: 2, color: "text.secondary", fontSize: '0.8125rem' }}>
        Showing {paginatedTransactions.length} of {filteredTransactions.length} transactions
        {filteredTransactions.length !== transactions.length &&
          ` (filtered from ${transactions.length} total)`}
      </Typography>

      {/* Table Container with ref for height measurement */}
      <Box position="relative" ref={tableContainerRef}>
        <TableContainer
          component={Paper}
          sx={{
            mb: 3,
            borderRadius: 1,
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
            position: 'relative',
            overflow: selectedTransaction ? 'hidden' : 'auto',
          }}
        >
          {userSwitchLoading && (
            <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }} />
          )}
          
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                  <TableSortLabel
                    active={sortField === "timestamp"}
                    direction={sortDirection}
                    onClick={() => handleSort("timestamp")}
                  >
                    Date & Time
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, fontSize: "0.8125rem" }}
                >
                  Platform
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                  <TableSortLabel
                    active={sortField === "id"}
                    direction={sortDirection}
                    onClick={() => handleSort("id")}
                  >
                    Transaction ID
                  </TableSortLabel>
                </TableCell>
                {isAdmin && !selectedUser && (
                  <TableCell sx={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                    User
                  </TableCell>
                )}
                <TableCell
                  align="right"
                  sx={{ fontWeight: 600, fontSize: "0.8125rem" }}
                >
                  <TableSortLabel
                    active={sortField === "amount"}
                    direction={sortDirection}
                    onClick={() => handleSort("amount")}
                  >
                    Amount
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                  <TableSortLabel
                    active={sortField === "status"}
                    direction={sortDirection}
                    onClick={() => handleSort("status")}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((transaction) => (
                  <TableRow 
                    key={transaction.id} 
                    hover
                    onClick={() => handleViewDetails(transaction)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      }
                    }}
                  >
                    <TableCell sx={{ fontSize: "0.8125rem" }}>
                      {formatDate(transaction.timestamp)}
                    </TableCell>
                    <TableCell align="center" sx={{ fontSize: "0.8125rem" }}>
                      {renderPlatform(transaction.campaignType)}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.8125rem" }}>
                      {formatId(transaction.id)}
                    </TableCell>
                    {isAdmin && !selectedUser && (
                      <TableCell sx={{ fontSize: "0.8125rem" }}>
                        <Box>
                          <Typography fontWeight={500} fontSize="0.8125rem">
                            {transaction.userName}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            fontSize="0.75rem"
                          >
                            {transaction.userPhone || "N/A"}
                          </Typography>
                        </Box>
                      </TableCell>
                    )}
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 600, fontSize: "0.8125rem" }}
                    >
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.8125rem" }}>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          px: 1,
                          py: 0.3,
                          borderRadius: 0.5,
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          backgroundColor:
                            transaction.status === "completed"
                              ? "rgba(46, 125, 50, 0.1)"
                              : transaction.status === "pending"
                              ? "rgba(245, 127, 23, 0.1)"
                              : transaction.status === "failed"
                              ? "rgba(198, 40, 40, 0.1)"
                              : transaction.status === "refunded"
                              ? "rgba(21, 101, 192, 0.1)"
                              : transaction.status === "processing"
                              ? "rgba(2, 119, 189, 0.1)"
                              : transaction.status === "cancelled"
                              ? "rgba(97, 97, 97, 0.1)"
                              : "#f5f5f5",
                          color:
                            transaction.status === "completed"
                              ? "#2e7d32"
                              : transaction.status === "pending"
                              ? "#f57f17"
                              : transaction.status === "failed"
                              ? "#c62828"
                              : transaction.status === "refunded"
                              ? "#1565c0"
                              : transaction.status === "processing"
                              ? "#0277bd"
                              : transaction.status === "cancelled"
                              ? "#616161"
                              : "#424242",
                        }}
                      >
                        {transaction.status.charAt(0).toUpperCase() +
                          transaction.status.slice(1)}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isAdmin && !selectedUser ? 6 : 5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="textSecondary">
                      No transactions found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Transaction Details Side Panel */}
        <AnimatePresence>
          {selectedTransaction && tableHeight && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: tableHeight,
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  zIndex: theme.zIndex.drawer,
                  cursor: 'pointer',
                }}
                onClick={handleCloseDetails}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ 
                  type: 'spring',
                  damping: 22,
                  stiffness: 300
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  height: tableHeight,
                  width: 'min(90vw, 500px)',
                  backgroundColor: 'white',
                  boxShadow: '-2px 0 20px rgba(0,0,0,0.1)',
                  zIndex: theme.zIndex.drawer + 1,
                  overflowY: 'auto',
                }}
              >
                <Box sx={{ p: 3 }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mb: 2
                    }}
                  >
                    <Typography variant="h6" fontWeight={600}>
                      Transaction Details
                    </Typography>
                    <IconButton onClick={handleCloseDetails}>
                      <Close />
                    </IconButton>
                  </Box>
                  
                  <List dense sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {Object.entries(selectedTransaction).filter(([key]) => 
                      key !== 'userId' && key !== 'id' && key !== 'referenceId'
                    ).map(([key, value]) => {
                      let displayValue: React.ReactNode = value;
                      
                      // Format known fields
                      if (key === 'timestamp') {
                        displayValue = formatDate(value);
                      } else if (key === 'amount') {
                        displayValue = formatCurrency(
                          value as number,
                          selectedTransaction.currency || 'INR'
                        );
                      } else if (key === 'campaignType') {
                        displayValue = renderPlatform(value as string);
                      } else if (key === 'txnid') {
                        displayValue = (
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body2" fontSize="0.75rem">
                              {formatId(String(value))}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="textSecondary"
                              fontSize="0.625rem"
                              sx={{ wordBreak: 'break-all' }}
                            >
                              {value}
                            </Typography>
                          </Box>
                        );
                      } else if (key === 'costPerLead') {
                        displayValue = formatCurrency(
                          value as number,
                          selectedTransaction.currency || 'INR'
                        ) + ' per lead';
                      } else if (typeof value === 'string' && value.length > 40) {
                        displayValue = (
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body2" fontSize="0.75rem">
                              {value.substring(0, 40)}...
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="textSecondary"
                              fontSize="0.625rem"
                              sx={{ wordBreak: 'break-all' }}
                            >
                              {value}
                            </Typography>
                          </Box>
                        );
                      }
                      
                      return (
                        <div key={key}>
                          <ListItem>
                            <ListItemText
                              primary={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              primaryTypographyProps={{ 
                                fontWeight: 500, 
                                fontSize: '0.75rem',
                                color: 'text.secondary'
                              }}
                              secondary={displayValue}
                              secondaryTypographyProps={{ 
                                fontSize: '0.75rem',
                                sx: { 
                                  wordBreak: 'break-word',
                                  ...(key === 'campaignType' ? { display: 'flex', justifyContent: 'flex-start' } : {})
                                }
                              }}
                            />
                          </ListItem>
                          <Divider component="li" />
                        </div>
                      );
                    })}
                  </List>
                  
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="contained" 
                      onClick={handleCloseDetails}
                      sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                    >
                      Close
                    </Button>
                  </Box>
                </Box>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </Box>

      {/* Pagination */}
      {pageCount > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            size="small"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Container>
  );
};

export default Orders;