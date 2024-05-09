import express from 'express'
import postgresClient from '../config/db.js'

const router = express.Router()

//Create Users
router.post('/', async (req, res) => {
    try {
        // Mevcut en büyük id'yi al
        const selectQuery = "SELECT * FROM users ORDER BY id ASC";
        const { rows } = await postgresClient.query(selectQuery);

        let maxId = 0;
        rows.forEach(row => {
            if (row.id > maxId) {
                maxId = row.id;
            }
        });

        console.log('En büyük ID:', maxId);
        // Yeni id'yi hesapla
        let newId = maxId + 1;

        // Yeni kullanıcıyı ekleme işlemi
        const insertText = "INSERT INTO users (id,email, password, fullname, serial_no) VALUES ($1, $2, crypt($3, gen_salt('bf')), $4, $5) RETURNING *";
        const insertValues = [newId, req.body.email, req.body.password, req.body.fullname, req.body.serial_no];
         
        const selectSerial = "SELECT * FROM Serial_No ORDER BY id ASC";
        const { rows:insertedSerial } = await postgresClient.query(selectSerial);
        const tableSerial = "SELECT serial_no FROM users "
        const { rows:insertedTableserial } = await postgresClient.query(tableSerial);
        let ak = false

        insertedTableserial.forEach(element => {
            if(element.serial_no == req.body.serial_no){
                ak = true
            }
        });
        
        if(req.body.serial_no == insertedSerial[0].serials && ak == false )
        {
            const { rows: insertedRows } = await postgresClient.query(insertText, insertValues);
            return res.status(201).json({ createdUser: insertedRows[0] });
            
        }
        else{
            return res.status(404).json({ message: 'Seri numaralari uyuşmamaktadir' })

        }


    } catch (error) {
        console.error('Error occurred', error.message);
        return res.status(400).json({ message: error.message });
    }
});

// Authenticate user login
router.post('/login', async (req, res) => {
    try {
        const text = "SELECT * FROM users WHERE email = $1 AND password = crypt($2, password)"

        const values = [req.body.email, req.body.password]

        const { rows } = await postgresClient.query(text, values)
        if (!rows.length)
            return res.status(404).json({ message: 'User not found.' })

        return res.status(200).json({ message: 'Authentication successful.' })
    } catch (error) {
        console.log('Error occured', error.message)
        return res.status(400).json({ message: error.message })
    }
})

// Update user
router.put('/update/:userId', async (req, res) => {
    try {
        const { userId } = req.params

        const text = "UPDATE users SET email = $1, fullname = $2 WHERE id = $3 RETURNING *"

        const values = [req.body.email, req.body.fullname, userId]

        const { rows } = await postgresClient.query(text, values)
        if (!rows.length)
            return res.status(404).json({ message: 'User not found.' })

        return res.status(200).json({ updatedUser: rows[0] })
    } catch (error) {
        console.log('Error occured', error.message)
        return res.status(400).json({ message: error.message })
    }
})


router.delete('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Silinecek kullanıcıyı belirten ID'ye sahip kullanıcıyı veritabanından silme işlemi
        const deleteText = "DELETE FROM users WHERE id = $1 RETURNING *";
        const deleteDegerler = [userId];

        const { rows } = await postgresClient.query(deleteText, deleteDegerler);
        if (!rows.length)
            return res.status(404).json({ message: 'Kullanici bulunamadi.' });

        // Kullanıcıyı sildikten sonra ID'leri yeniden yapılandırma işlemi
        const updateText = "UPDATE users SET id = id - 1 WHERE id > $1";
        const updateDegerler = [userId];
        await postgresClient.query(updateText, updateDegerler);

        return res.status(200).json({ deletedUser: rows[0] });
    } catch (error) {
        console.log('Hata oluştu', error.message);
        return res.status(400).json({ message: error.message });
    }
});

// Get users
router.get('/', async (req, res) => {
    try {
        console.log('asjkaskfhajksfhasjfkahsfkjasf')
        const text = "SELECT * FROM users ORDER BY id ASC";
        const { rows } = await postgresClient.query(text);

        return res.status(200).json(rows);
    } catch (error) {
        console.error('Hata oluştu', error.message);
        return res.status(400).json({ message: error.message });
    }
});

export default router
